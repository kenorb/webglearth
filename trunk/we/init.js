
/**
 * @fileoverview Contains functions for WebGL Earth initialization.
 *
 * @author slouppetr@gmail.com (Petr Sloup)
 *
 */

goog.provide('we');

goog.require('goog.Timer');
goog.require('goog.debug.Logger');
goog.require('goog.dom');

goog.require('goog.events');
goog.require('we.debug');
goog.require('we.gl.Context');
goog.require('we.scene.Dragger');
goog.require('we.scene.Scene');

//Dummy dependencies
goog.addDependency('',
                   ['goog.debug.ErrorHandler', 'goog.events.EventHandler'], []);


/**
 * Initializes everything
 * @param {!Element} canvas Canvas element.
 */
we.init = function(canvas) {
  if (goog.DEBUG) {
    we.debug.initDivConsole(goog.dom.getElement('log'));
  }

  var innerInit = function() {
    if (goog.DEBUG)
      we.logger.info('Initializing...');

    var context = new we.gl.Context(canvas);
    context.setPerspective(50, 0.000001, 5);

    we.loopTimer = new goog.Timer(15);
    goog.events.listen(
        we.loopTimer,
        goog.Timer.TICK,
        function() {context.renderFrame()}
    );

    context.scene = new we.scene.Scene(context);
    var dragger = new we.scene.Dragger(context.scene);

    if (goog.DEBUG) {
      we.logger.info('Done');
      we.logger.info('Starting the loop...');
    }
    we.loopTimer.start();
  }

  if (goog.DEBUG) {
    try {
      innerInit();
    } catch (e) {
      goog.debug.Logger.getLogger('we.ex').shout(goog.debug.deepExpose(e));
    }
  } else {
    innerInit();
  }
};

if (goog.DEBUG) {
  /**
   * Shared logger instance
   * @type {goog.debug.Logger}
   */
  we.logger = goog.debug.Logger.getLogger('we');
}

goog.exportSymbol('we.init', we.init);
