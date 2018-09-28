/*
  unstated7.js

  This is the same thing as that, it goes without saying. 
  
  by UNIHO.

*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.unstated7 = factory());
}(this, (function () { 'use strict';
  
  function unstated7() {
  }

  unstated7._containers = {};

  // inject(Instance of Container, ...)
  unstated7.inject = function() {
    unstated7._containers = {};
    Array.prototype.forEach.call(arguments, function(item) { 
      unstated7._containers[item.constructor] = item;
    }, this);
  }

  // Container Class
  unstated7.Container = function() {
    this._listeners = [];
  };
  unstated7.Container.prototype.setState = function(updater, callback) {
    const nextState = typeof updater === 'function' ?
      updater(this.state) : updater;

    if (nextState == null) {
      if (callback) callback();
      return;
    }

    //this.state = Object.assign({}, this.state, nextState);
    for (let p in nextState) this.state[p] = nextState[p];

    let counter = this._listeners.length;
    const finish = function() {
      counter--;
      if (callback && !counter) callback();
    };
    this._listeners.forEach(function(item) {
      setTimeout(function() {
        if (this._listeners.indexOf(item) < 0) {
          finish();
          return;
        }  
        item.forceUpdate(finish);
      }.bind(this), 0);
    }, this);
  };  
  unstated7.Container.prototype.subscribe = function(item) {
    if (this._listeners.indexOf(item) >= 0) return;
    this._listeners.push(item);
  };
  unstated7.Container.prototype.unsubscribe = function(item) {
    this._listeners = this._listeners.filter(function(f) { return f !== item });
  };

  // Subscribe Class
  unstated7.Subscribe = function(props) {
    React.Component.call(this, props);
    this.instances = [];
  };
  Object.setPrototypeOf(unstated7.Subscribe.prototype, React.Component.prototype);
  unstated7.Subscribe.prototype.componentWillUnmount = function() {
    this.instances.forEach(function(item) {item.unsubscribe(this)}, this);
  };
  unstated7.Subscribe.prototype.render = function() {
    const to = this.props.to;
    this.instances = to.map(function(item) {
      let instance;
      if (typeof item === 'object') {
        instance = item;
      } else if (item in unstated7._containers) {
        instance = unstated7._containers[item];
      } else {
        instance = new item();
        unstated7._containers[item] = instance;
      }
      instance.subscribe(this);
      return instance;
    }, this);

    //return this.props.children(...this.instances);
    return this.props.children.apply(null, this.instances);
  };

  return unstated7;

})));
