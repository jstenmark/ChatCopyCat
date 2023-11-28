import { EventEmitter } from 'events'
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// To the the reference command


// Nested Symbols - references nothing
namespace MyNamespace {
  class MyClass {
    method() {}
  }
}

// Overloaded Methods - method encloses class
class MyClassOverloaded {
  method(a: number): void
  method(a: string): void
  method(a: any): void {a}

  notoverloaded(_a:number):void {}
}

// Inherited Members - Parent encloess bot classes - should only reference=class ParentClass, class ChildClass extends ParentClass)
class ParentClass {
  parentMethod() {}
}

class ChildClass extends ParentClass {
  childMethod() {}
}

// Anonymous Types or Functions
const myFunction = function() {}
const myObject = {property: 'value'}

// Generic Types
class GenericClass<T> {
  methodA(_paramA: T) {}
}
class GenericClassB<T> {
  methodB(_paramB: T) {}
}

// Modifiers - encapsulates class
class MyClassModifiers {
  public publicMethod() {}
  private privateMethod() {}
}

// Attributes or Annotations - encapsulates class
function MyDecorator(_target: any, _propertyKey: string | symbol) {}

class MyClassAttributesAnnotations {
  @MyDecorator
  method() {}
}

// Constructs (ts specific) - encapsulates interface, but also the whole class, should only encapsulate interface as before but only "class MyClassConstructs implements IMyInterface"
interface IMyInterface {
  method(): void;
}

class MyClassConstructs implements IMyInterface {
  method() {}
}


// Preprocessor Directive (non ts) - should only encapsulate method
const DEBUG = true
class MyClassPreprocessor {
  method() {
    if (DEBUG) {
      // Debug code
    }
  }
}

// Comments and docs - encapsulate class
/**
 * This is a class.
 */
class MyClass {
  /**
   * This is a method.
   */
  //test
  methodA() {}

  /**
   * This is a method.
   */
  methodB() {}
}

// Error Handling Constructs - try doesnt encapsulate try, catch doesnt encapsulate catch, error only encapsulates "catch (error"
try {
  // some code

} catch (error) {
  console.error(error)
}


// Event Handlers and Callbacks - classes only references the instance, eventhandlers doesnt reference anything
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter()
myEmitter.on('click', () => {
  console.log('A click event occurred!')
})
myEmitter.emit('click')

// Lambda Expressions and Closures
const myFunctionLambda = (x: number) => x * x
