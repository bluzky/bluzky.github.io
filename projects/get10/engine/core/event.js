var E = E || {};
E.Observable = (function() {
  function Observable(obj) {
    if (obj) return mixin(obj);
  }


  function mixin(obj) {
    for (var key in Observable.prototype) {
      obj[key] = Observable.prototype[key];
    }
    return obj;
  }


  Observable.prototype.on = function(event, fn) {
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
      .push(fn);
      return this;
    };


  Observable.prototype.once = function(event, fn) {
    function on() {
      this.off(event, on);
      fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
  };


  Observable.prototype.off = function(event, fn) {
      this._callbacks = this._callbacks || {};

      // all
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };


  Observable.prototype.trigger = function(event) {
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1);
    var callbacks = this._callbacks['$' + event];

    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  };

  Observable.prototype.listeners = function(event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks['$' + event] || [];
  };


  Observable.prototype.hasListeners = function(event) {
    return !!this.listeners(event).length;
  };

  return Observable;
})(E);
