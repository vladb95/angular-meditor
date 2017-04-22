/* angular-meditor directive
 */

angular.module('angular-meditor', ['colorpicker.module', 'ngPopover'])
  .directive('meditor', ['$timeout', function ($timeout) {
    return {
      scope: {
        ngModel: '=',
        toolbarContainer: '@?'
      },
      require: '?ngModel',
      transclude: true,
      template: '<div class="angular-meditor"><div class="angular-meditor-toolbar" style="top: {{ position.top }}px; left: {{ position.left }}px" ng-class="{ \'angular-meditor-toolbar--show\': model.showToolbar, \'angular-meditor-toolbar--bottom\': position.below }"><ul><li><button type="button" ng-click="SimpleAction(\'bold\')" class="meditor-button-bold" ng-class="{ \'bold\': \'meditor-button--active\' }[styles.fontWeight]">B</button></li><li><button type="button" ng-click="SimpleAction(\'italic\')" class="meditor-button-italic" ng-class="{ \'italic\': \'meditor-button--active\' }[styles.fontStyle]">I</button></li><li><button type="button" ng-click="SimpleAction(\'underline\')" class="meditor-button-underline" ng-class="{ \'underline\': \'meditor-button--active\' }[styles.textDecoration]">U</button></li><li><button type="button" ng-click="SimpleAction(\'insertUnorderedList\')" class="meditor-button-list-ul" ng-class="{ \'underline\': \'meditor-button--active\' }[styles.textDecoration]"><i class="fa fa-list-ul"></i></button></li><li><button type="button" ng-click="SimpleAction(\'insertOrderedList\')" class="meditor-button-list-ol" ng-class="{ \'underline\': \'meditor-button--active\' }[styles.textDecoration]"><i class="fa fa-list-ol"></i></button></li><li><button type="button" ng-click="SimpleAction(\'formatBlock\', \'blockquote\')" class="meditor-button-quote" ng-class="{ \'underline\': \'meditor-button--active\' }[styles.textDecoration]"><i class="fa fa-quote-right"></i></button></li><li><button type="button" class="meditor-button-quote" ng-class="{ \'underline\': \'meditor-button--active\' }[styles.textDecoration]" colorpicker ng-change="SimpleAction(\'foreColor\', color)" ng-model="color"><i class="fa fa-font"></i></button></li><li><label class="meditor-select"><select ng-model="size" ng-options="s.value as s.label for s in sizeOptions" class="meditor-size-selector"></select></label></li><li><label class="meditor-select"><select ng-model="family" ng-options="s as s.label for s in familyOptions" class="meditor-family-selector"></select></label></li><li><button type="button" ng-click="SimpleAction(\'link\')" class="meditor-button-link" ng-class="{ \'underline\': \'meditor-button--active\' }[styles.textDecoration]"><i class="fa fa-link"></i></button></li><li><button type="button" ng-click="SimpleAction(\'insertImage\', \'http://cfis.github.io/free-image-ruby/cookbook/lena_rotate_ex_45_masked.png\')" class="meditor-button-link" ng-class="{ \'underline\': \'meditor-button--active\' }[styles.textDecoration]"><i class="fa fa-picture-o"></i></button></li></ul></div><div class="angular-meditor-content" contenteditable meditor-contenteditable ng-model="model.ngModel" ng-transclude></div></div>',
      link: function (scope, element, attributes, ctrl) {

        scope.model = {
          ngModel: scope.ngModel,
          showToolbar: false
        };

        scope.color = '';

        scope.$watch('model.ngModel', function () {
          $timeout(function () {
            scope.ngModel = scope.model.ngModel;
          });
        });

        // toolbar position
        scope.position = {
          top: 10,
          left: 10,
          below: false
        };

        // fontSize options
        scope.sizeOptions = [
          {
            label: '10',
            value: 1
          },
          {
            label: '13',
            value: 2
          },
          {
            label: '16',
            value: 3
          },
          {
            label: '18',
            value: 4
          },
          {
            label: '24',
            value: 5
          },
          {
            label: '32',
            value: 6
          },
          {
            label: '48',
            value: 7
          }
        ];
        scope.size = scope.sizeOptions[0].value;

        scope.familyOptions = [
          {
            label: 'Open Sans',
            value: 'Open Sans, sans-serif'
          },
          {
            label: 'Source Sans Pro',
            value: 'Source Sans Pro, sans-serif'
          },
          {
            label: 'Exo',
            value: 'Exo, sans-serif'
          },
          {
            label: 'Oswald',
            value: 'Oswald, sans-serif'
          },
          {
            label: 'Cardo',
            value: 'Cardo, serif'
          },
          {
            label: 'Vollkorn',
            value: 'Vollkorn, serif'
          },
          {
            label: 'Old Standard TT',
            value: 'Old Standard TT, serif'
          }
        ];
        scope.family = scope.familyOptions[0];

        // current styles of selected elements
        // used to highlight active buttons
        scope.styles = {};

        // tags generated by the editor
        // used to highlight active styles
        var generatedTags = {
          'b': '',
          'strong': '',
          'i': '',
          'em': '',
          'u': '',
          'blockquote': ''
        };

        // Remy Sharp's debounce
        // https://remysharp.com/2010/07/21/throttling-function-calls
        var debounce = function (fn, delay) {
          var timer = null;
          return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
              fn.apply(context, args);
            }, delay);
          };
        };

        var $toolbar = angular.element(element[0].querySelector('.angular-meditor-toolbar'));
        var $content = angular.element(element[0].querySelector('.angular-meditor-content'));
        var $selects = angular.element(element[0].querySelector('select'));
        var $body = angular.element(document.querySelector(scope.toolbarContainer) || document.body);

        // position the toolbar above or below the selected text
        var setToolbarPosition = function () {
          var toolbarHeight = $toolbar[0].offsetHeight;
          var toolbarWidth = $toolbar[0].offsetWidth;
          var spacing = 5;
          var selection = window.getSelection();
          var range = selection.getRangeAt(0);
          var boundary = range.getBoundingClientRect();

          var topPosition = boundary.top;
          var leftPosition = boundary.left;

          // if there isn't enough space at the top, place it at the bottom
          // of the selection
          if (boundary.top < (toolbarHeight + spacing)) {
            scope.position.top = topPosition + boundary.height + spacing;
            // tell me if it's above or below the selection
            // used in the template to place the triangle above or below
            scope.position.below = true;
          } else {
            scope.position.top = topPosition - toolbarHeight - spacing;
            scope.position.below = false;
          }

          // center toolbar above selected text
          scope.position.left = leftPosition - (toolbarWidth / 2) + (boundary.width / 2);

          // cross-browser window scroll positions
          var scrollLeft = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
          var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

          // add the scroll positions
          // because getBoundingClientRect gives us the position
          // relative to the viewport, not to the page
          scope.position.top += scrollTop;
          scope.position.left += scrollLeft;

          return this;
        };

        // get current selection and act on toolbar depending on it
        var checkSelection = function (e) {

          // if you click something from the toolbar
          // don't do anything
          if (e && e.target && $toolbar.find(e.target).length) {
            return false;
          }

          var newSelection = window.getSelection();

          // get selection node
          var anchorNode = newSelection.anchorNode;

          // if nothing selected, hide the toolbar
          if (newSelection.toString().trim() === '' || !anchorNode) {
            // hide the toolbar
            return $timeout(function () {
              scope.model.showToolbar = false;
            });
          }

          // check if selection is in the current editor/directive container
          var parentNode = anchorNode.parentNode;
          while (parentNode.tagName !== undefined && parentNode !== element[0]) {
            parentNode = parentNode.parentNode;
          }

          // if the selection is in the current editor
          if (parentNode === element[0]) {
            // show the toolbar
            $timeout(function () {
              scope.model.showToolbar = true;
              setToolbarPosition();
            });

            // check selection styles and active buttons based on it
            checkActiveButtons(newSelection);
          } else {
            // hide the toolbar
            $timeout(function () {
              scope.model.showToolbar = false;
            });
          }

          return this;
        };

        // check current selection styles and activate buttons
        var checkActiveButtons = function (selection) {
          var parentNode = selection.anchorNode;

          if (!parentNode.tagName) {
            parentNode = selection.anchorNode.parentNode;
          }

          var childNode = parentNode.childNodes[0];

          if (childNode && childNode.tagName && childNode.tagName.toLowerCase() in generatedTags) {
            parentNode = parentNode.childNodes[0];
          }

          $timeout(function () {
            // get real styles of selected element
            scope.styles = window.getComputedStyle(parentNode, null);

            if (scope.styles.fontSize !== scope.size.label + 'px') {
              // set font size selector
              angular.forEach(scope.sizeOptions, function (size, i) {
                if (scope.styles.fontSize === (size.label + 'px')) {
                  scope.size = scope.sizeOptions[i].value;
                  return false;
                }
              });
            }

          });

        };

        // check selection when selecting with the shift key
        $content.bind('keyup', checkSelection);

        // check the selection on every mouseup
        // it also triggeres when releasing outside the browser

        // use debounce to fix issue with Chrome
        // getting the right selection only after a delay
        // if selecting text, then single-clicking the selected text
        document.addEventListener('mouseup', debounce(checkSelection, 200));

        $content.bind('blur', debounce(checkSelection, 200));

        // if after a selection in the select,
        // the contenteditable doesn't get the focus
        // the toolbar will not hide on blur.
        // so I have to add a blur event to the selects.
        $selects.bind('blur', debounce(checkSelection, 200));

        // simple edit action - bold, italic, underline
        scope.SimpleAction = function (action, tag) {
          if (!tag) tag = null;
          document.execCommand('styleWithCSS', false, false);
          document.execCommand(action, false, tag);

          // custom event for two-way binding
          scope.$broadcast('meditor-change');
        };

        // watch the font size selector
        scope.$watch('size', function () {
          document.execCommand('styleWithCSS', false, false);
          document.execCommand('fontSize', false, scope.size);

          // custom event for two-way binding
          scope.$broadcast('meditor-change');
        });

        // watch the font family selector
        scope.$watch('family', function () {
          // dynamically load the family from google fonts
          if (window.WebFont) {
            WebFont.load({
              google: {
                families: [scope.family.label]
              }
            });
          }

          document.execCommand('styleWithCSS', false, true);
          document.execCommand('fontName', false, scope.family.value);

          // custom event for two-way binding
          scope.$broadcast('meditor-change');
        });

        // load google webfont library
        // to be able to dynamically load fonts
        (function () {
          var wf = document.createElement('script');
          wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
          wf.type = 'text/javascript';
          wf.async = 'true';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(wf, s);
        })();

        // move the toolbar to the body, we can use overflow: hidden on containers
        $body.append($toolbar);

      }
    };
  }])
  .directive('meditorContenteditable', ['$timeout', function ($timeout) {
    'use strict';

    return {
      require: '?ngModel',
      link: function (scope, elm, attrs, ctrl) {

        // don't throw an error without ng-model
        if (typeof scope.ngModel !== 'undefined') {

          var change = function () {
            $timeout(function () {
              ctrl.$setViewValue(elm.html());
            });
          };

          // custom event to change the ngModel after using
          // actions from the editor
          scope.$on('meditor-change', change);

          elm.on('blur keyup', change);

          ctrl.$render = function () {
            elm.html(ctrl.$viewValue);
          };

          ctrl.$setViewValue(scope.ngModel);
          elm.html(ctrl.$viewValue);

          scope.$watch('ngModel', function (ngModel) {
            // change the html only if it's different from the model
            // eg. on outside changes
            // so we don't lose the selection when editing with the
            // editor toolbar
            if (elm.html() !== ngModel) {
              elm.html(ngModel);
            }
          });

        }

      }
    };
  }]);
