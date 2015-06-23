/* globals $ */
'use strict';

angular.module('jhipsterApp')
    .directive('type', function($q) {
        var slice = Array.prototype.slice;

        // pass in an HTML5 ArrayBuffer, returns a base64 encoded string
        function arrayBufferToBase64( arrayBuffer ) {
            var bytes = new Uint8Array( arrayBuffer );
            var len = bytes.byteLength;
            var binary = '';
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode( bytes[ i ] );
            }
            return window.btoa( binary );
        }

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (attrs.type !== 'file') return;
                if (!ngModel) return;

                ngModel.$render = function() {};

                element.bind('change', function(e) {
                    var element = e.target;

                    $q.all(slice.call(element.files, 0).map(readFile))
                        .then(function(values) {
                            if (element.multiple) {
                                ngModel.$setViewValue(values);
                            } else{
                                ngModel.$setViewValue(values.length ? values[0] : null);

                            }
                        });

                    function readFile(file) {
                        $(element).val('');
                        var deferred = $q.defer();

                        var reader = new FileReader();
                        reader.onload = function(e) {
                            deferred.resolve(arrayBufferToBase64(e.target.result));

                            element.val('');
                        };
                        reader.onerror = function(e) {
                            deferred.reject(e);
                        };
                        reader.readAsArrayBuffer(file);

                        return deferred.promise;
                    }

                }); //change

            }
        };
    });
