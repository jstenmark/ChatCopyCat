
// Either match lines like
// "    at fulfilled (/Users/roblou/code/testapp-node2/out/app.js:5:58)"
// or
// "    at /Users/roblou/code/testapp-node2/out/app.js:60:23"
// and replace the path in them
const re1 = /^(\W*at .*\()(.*):(\d+):(\d+)(\))$/
const re2 = /^(\W*at )(.*):(\d+):(\d+)$/

export class StackTraceParser {
  /** Gets whether the stacktrace has any locations in it. */
  public static isStackLike(str: string) {
    return re1.test(str) || re2.test(str)
  }
  constructor(private readonly stack: string) { }

  /** Iterates over segments of text and locations in the stack. */
  *[Symbol.iterator]() {
    for (const line of this.stack.split('\n')) {
      const match = re1.exec(line) || re2.exec(line)
      if (!match) {
        yield line + '\n'
        continue
      }

      const [, prefix, url, lineNo, columnNo, suffix] = match
      if (prefix) {
        yield prefix
      }

      yield new StackTraceLocation(url, new Base1Position(Number(lineNo), Number(columnNo)))

      if (suffix) {
        yield suffix
      }

      yield '\n'
    }
  }
}

export class StackTraceLocation {
  constructor(public readonly path: string, public readonly position: Base1Position) { }

  public toString() {
    return `${this.path}:${this.position.lineNumber}:${this.position.columnNumber}`
  }
}

/**
 * Defines a position which gives accessors to various projections. We use
 * many different kinds of bases for different consumers, this is intended
 * to elimate off-by-1 errors.
 */
export interface IPosition {
  base0: Base0Position
  base1: Base1Position
  base01: Base01Position
  /**
   * Compares the position and returns the sort order, <0 if `this` is
   * before `other`, >0 if it's after, 0 if it's equal.
   */
  compare(other: IPosition): number
}

export const comparePositions = (a: IPosition, b: IPosition) => {
  if (a instanceof Base0Position) {
    return a.compare(b.base0)
  } else if (a instanceof Base01Position) {
    return b.compare(b.base01)
  } else if (a instanceof Base1Position) {
    return b.compare(b.base1)
  } else {
     
    throw new Error(`Invalid position ${a}`)
  }
}

/**
 * A position that starts a line 0 and column 0 (used by CDP).
 */
export class Base0Position implements IPosition {
  declare readonly __isBase0: undefined

  constructor(public readonly lineNumber: number, public readonly columnNumber: number) { }

  public get base0() {
    return this
  }

  public get base1() {
    return new Base1Position(this.lineNumber + 1, this.columnNumber + 1)
  }

  public get base01() {
    return new Base01Position(this.lineNumber, this.columnNumber + 1)
  }

  public compare(other: Base0Position) {
    const other0 = other.base0
    return this.lineNumber - other0.lineNumber || this.columnNumber - other0.columnNumber
  }
}

/**
 * A position that starts a line 1 and column 1 (used by DAP).
 */
export class Base1Position implements IPosition {
  declare readonly __isBase1: undefined

  constructor(public readonly lineNumber: number, public readonly columnNumber: number) { }

  public get base0() {
    return new Base0Position(this.lineNumber - 1, this.columnNumber - 1)
  }

  public get base1() {
    return this
  }

  public get base01() {
    return new Base01Position(this.lineNumber - 1, this.columnNumber)
  }

  public compare(other: Base1Position) {
    const other1 = other.base1
    return this.lineNumber - other1.lineNumber || this.columnNumber - other1.columnNumber || 0
  }
}

/**
 * A position that starts a line 0 and column 1 (used by sourcemaps).
 */
export class Base01Position implements IPosition {
  declare readonly __isBase01: undefined

  constructor(public readonly lineNumber: number, public readonly columnNumber: number) { }

  public get base0() {
    return new Base0Position(this.lineNumber - 1, this.columnNumber)
  }

  public get base1() {
    return new Base1Position(this.lineNumber, this.columnNumber + 1)
  }

  public get base01() {
    return this
  }

  public compare(other: Base01Position) {
    const other01 = other.base01
    return this.lineNumber - other01.lineNumber || this.columnNumber - other01.columnNumber
  }
}

export class Range {
  public static ZERO = new Range(new Base0Position(0, 0), new Base0Position(0, 0))
  public static INFINITE = new Range(
    new Base0Position(0, 0),
    new Base0Position(Infinity, Infinity),
  )

  /**
   * Simplifies the list of ranges by combining overlapping ranges.
   */
  public static simplify(rangeList: readonly Range[]): Range[] {
    if (rangeList.length === 0) {
      return []
    }

    const sortedRanges = rangeList.slice().sort((a, b) => a.begin.compare(b.begin))
    const mergedRanges: Range[] = []

    let currentRange = sortedRanges[0]
    for (let i = 1; i < sortedRanges.length; i++) {
      const nextRange = sortedRanges[i]
      if (currentRange.end.compare(nextRange.begin) >= 0) {
        currentRange = new Range(currentRange.begin, nextRange.end)
      } else {
        mergedRanges.push(currentRange)
        currentRange = nextRange
      }
    }
    mergedRanges.push(currentRange)

    return mergedRanges
  }

  constructor(public readonly begin: IPosition, public readonly end: IPosition) { }

  /**
   * Returns if the range contains the given position, inclusive.
   */
  public contains(position: IPosition) {
    return position.compare(this.begin) >= 0 && position.compare(this.end) <= 0
  }

  /** Returns a human-debuggable representation of the range. */
  public toString() {
    const b1 = this.begin.base0
    const e1 = this.end.base0
    return `Range[${b1.lineNumber}:${b1.columnNumber} -> ${e1.lineNumber}:${e1.columnNumber}]`
  }
}
