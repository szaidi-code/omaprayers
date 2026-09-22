const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const test = require("node:test")
const vm = require("node:vm")
const requireQmlJs = require("./qml-js-loader.js")
const Model = requireQmlJs(path.join(__dirname, "..", "Model.js"), module)
const panel = readFileSync(path.join(__dirname, "..", "Panel.qml"), "utf8")
const manifest = require("../manifest.json")
const prayerAt = Date.parse("2026-08-14T13:00:00+03:00")

// Execute the panel's real settings bindings and tick handler with a controlled
// clock, so these checks catch wiring regressions as well as event boundaries.
function createPanel(settings = {}) {
  let now = prayerAt - 121 * 60_000
  const queued = []
  const context = vm.createContext({
    Model,
    Date: class extends Date { static now() { return now } },
    setting: (key, fallback) => settings[key] ?? fallback,
    previousTickEpoch: now,
    nowTick: null,
    schedule: { days: [{ timings: { Dhuhr: {
      at: new Date(prayerAt).toISOString(), time: "13:00"
    } } }] },
    queueNotifications: events => queued.push(...events)
  })
  for (const match of panel.matchAll(/^  readonly property (?:int|bool) (\w+): (.+)$/gm)) {
    const [, name, expression] = match
    Object.defineProperty(context, name, {
      get: () => vm.runInContext(expression, context)
    })
  }
  const tick = panel.match(/  function tick\(\) \{[\s\S]*?\n  \}/)
  assert.ok(tick, "Panel.qml defines tick")
  vm.runInContext(tick[0], context)
  return {
    queued,
    tick(at) { now = at; context.tick() }
  }
}

for (const lead of [5, 15, 20, 60, 120]) {
  test(`panel sends one advance reminder at the ${lead}-minute accent lead`, () => {
    const panel = createPanel({ notifications: true, highlightBeforeMinutes: lead, notifyBeforeMinutes: 10 })
    const boundary = prayerAt - lead * 60_000
    panel.tick(boundary - 1)
    assert.equal(panel.queued.length, 0)
    panel.tick(boundary)
    assert.equal(panel.queued.length, 1)
    assert.equal(panel.queued[0].kind, "before")
    assert.equal(panel.queued[0].minutes, lead)
    assert.equal(panel.queued[0].triggerEpoch, boundary)
    panel.tick(boundary + 1)
    if (lead > 10) panel.tick(prayerAt - 10 * 60_000)
    assert.equal(panel.queued.length, 1, "no repeat or legacy 10-minute reminder")
    panel.tick(prayerAt)
    assert.deepEqual(panel.queued.map(event => event.kind), ["before", "at"])
  })
}

test("default reminder uses the manifest's accent lead even with an old saved reminder setting", () => {
  const panel = createPanel({ notifications: true, notifyBeforeMinutes: 30 })
  const lead = manifest.barWidget.defaults.highlightBeforeMinutes
  panel.tick(prayerAt - lead * 60_000 - 1)
  panel.tick(prayerAt - lead * 60_000)
  assert.equal(panel.queued.length, 1)
  assert.equal(panel.queued[0].minutes, lead)
})

test("Accent lead Off keeps prayer-time notifications", () => {
  const panel = createPanel({ notifications: true, highlightBeforeMinutes: 0 })
  panel.tick(prayerAt - 10 * 60_000)
  panel.tick(prayerAt - 1)
  assert.equal(panel.queued.length, 0)
  panel.tick(prayerAt)
  assert.deepEqual(panel.queued.map(event => event.kind), ["at"])
})

test("notifications disabled suppresses both reminders", () => {
  const panel = createPanel({ notifications: false, highlightBeforeMinutes: 20 })
  panel.tick(prayerAt - 20 * 60_000)
  panel.tick(prayerAt)
  assert.equal(panel.queued.length, 0)
})

test("changing Accent lead updates the running panel's reminder timing", () => {
  const settings = { notifications: true, highlightBeforeMinutes: 15 }
  const panel = createPanel(settings)
  panel.tick(prayerAt - 30 * 60_000)
  settings.highlightBeforeMinutes = 20
  panel.tick(prayerAt - 20 * 60_000)
  assert.equal(panel.queued.length, 1)
  assert.equal(panel.queued[0].minutes, 20)
})
