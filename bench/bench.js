'use strict'

const I = require('../dist/infestines.min')
const R = require('ramda')
const sprintf = require('sprintf-js').sprintf

const addU = (x, y) => x + y
const addN = I.curry(addU)
const addR = R.curry(addU)

const acyclicEquals = I.curry(I.acyclicEqualsU)
const identical = I.curry(I.identicalU)
const whereEq = I.curry(I.whereEqU)

const d1 = {x: [1], z: {}, y: {z: [1, 2, {a: [3]}]}}
const d2 = {x: [1], z: {}, y: {z: [1, 2, {a: [3]}]}}

const ks = ['a', 'b', 'c']
const vs = [1, 2, 3]

const xyz = {x: 1, y: 2, z: 3}

const vs1000 = Array(1000).fill(1)

const inc = x => x + 1
const inc2 = x => inc(inc(x))
const inc2I = I.pipe2U(inc, inc)
const inc2R = R.pipe(inc, inc)

const Benchmark = require('benchmark')
Benchmark.options.maxTime = Number(process.argv[2]) || Benchmark.options.maxTime

R.forEach(
  bs => {
    global.gc()
    const s = new Benchmark.Suite()
    bs.reverse().forEach(b => {
      b = b.replace(/[ \n]+/g, ' ')
      s.add(b, eval('() => ' + b))
    })
    s.on('complete', complete)
    s.run()
  },
  [
    ['I.hasU("x", d1)', 'I.hasU("a", d1)', '"x" in d1', '"y" in d1'],
    ['I.isFunction(inc)', 'I.isNumber(0)', 'I.isString("")'],
    [
      'I.dissocPartialU("x", xyz)',
      'I.dissocPartialU("z", xyz)',
      'I.dissocPartialU("_", xyz)'
    ],
    [
      'I.assocPartialU("x", -1, xyz)',
      'I.assocPartialU("z", -1, xyz)',
      'I.assocPartialU("_", -1, xyz)'
    ],
    [`addU(1, 2)`],
    [`R.add(1, 2)`, `addN(1, 2)`, `addR(1, 2)`],
    [`R.add(1)(2)`, `addN(1)(2)`, `addR(1)(2)`],
    [`I.isObject(d1)`, `I.isObject(null)`, `I.isObject(5)`, `I.isObject(vs)`],
    [`I.isArray(d1)`, `I.isArray(null)`, `I.isArray(5)`, `I.isArray(vs)`],
    [`Array.isArray(d1)`, `Array.isArray(null)`, `Array.isArray(vs)`],
    [`inc2(1)`, `inc2I(1)`, `inc2R(1)`],
    [
      `(x => inc(inc(x)))(1)`,
      `I.pipe2U(inc, inc)(1)`,
      `I.compose2U(inc, inc)(1)`,
      `R.compose(inc, inc)(1)`,
      `R.pipe(inc, inc)(1)`
    ],
    [`I.whereEqU(d1, d2)`, `whereEq(d1, d2)`, `R.whereEq(d1, d2)`],
    [`I.keys(d1)`, `Object.keys(d1)`, `R.keys(d1)`],
    [`I.values(d1)`, `R.values(d1)`],
    [
      `I.seq(0, inc)`,
      `I.seq(0, inc, inc)`,
      `I.seq(0, inc, inc, inc)`,
      `I.seq(0, inc, inc, inc, inc)`
    ],
    [
      `I.identicalU(null, null)`,
      `Object.is(null, null)`,
      `R.identical(null, null)`,
      `identical(null, null)`
    ],
    [`I.acyclicEqualsU(d1, d2)`, `R.equals(d1, d2)`, `acyclicEquals(d1, d2)`]
  ]
)

function complete() {
  const bs = I.seq(
    this,
    R.values,
    R.filter(R.is(Benchmark)),
    R.sortBy(R.prop('hz')),
    R.reverse
  )
  const fastest = I.seq(bs, R.map(R.prop('hz')), R.reduce(R.max, 0))
  bs.forEach(b => {
    console.log(
      sprintf(
        '%12s/s %7.2fx  %s',
        Math.round(b.hz).toLocaleString(),
        fastest / b.hz,
        b.name
      )
    )
  })
  console.log()
}
