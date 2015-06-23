'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>Controller', function ($scope<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %><% if (searchEngine == 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination != 'no') { %>, ParseLinks<% } %>) {
        $scope.<%= entityInstance %>s = [];<% for (idx in differentTypes) { if (differentTypes[idx] != entityClass) { %>
        $scope.<%= differentTypes[idx].toLowerCase() %>s = <%= differentTypes[idx] %>.query();<% } } %><% if (pagination == 'pager' || pagination == 'pagination') { %>
        $scope.page = 1;
        $scope.loadAll = function() {
            <%= entityClass %>.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.<%= entityInstance %>s = result;
            });
        };<% } %><% if (pagination == 'infinite-scroll') { %>
        $scope.page = 1;
        $scope.loadAll = function() {
            <%= entityClass %>.query({page: $scope.page, per_page: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                for (var i = 0; i < result.length; i++) {
                    $scope.<%= entityInstance %>s.push(result[i]);
                }
            });
        };
        $scope.reset = function() {
            $scope.page = 1;
            $scope.<%= entityInstance %>s = [];
            $scope.loadAll();
        };<% } %><% if (pagination != 'no') { %>
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };<% } %><% if (pagination == 'no') { %>
        $scope.loadAll = function() {
            <%= entityClass %>.query(function(result) {
               $scope.<%= entityInstance %>s = result;
            });
        };<% } %>
        $scope.loadAll();

        $scope.showUpdate = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
                $scope.<%= entityInstance %> = result;
                $('#save<%= entityClass %>Modal').modal('show');
            });
        };

        $scope.save = function () {
            if ($scope.<%= entityInstance %>.id != null) {
                <%= entityClass %>.update($scope.<%= entityInstance %>,
                    function () {
                        $scope.refresh();
                    });
            } else {
                <%= entityClass %>.save($scope.<%= entityInstance %>,
                    function () {
                        $scope.refresh();
                    });
            }
        };

        $scope.delete = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
                $scope.<%= entityInstance %> = result;
                $('#delete<%= entityClass %>Confirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {<% if (pagination != 'infinite-scroll') { %>
                    $scope.loadAll();<% } else { %>
                    $scope.reset();<% } %>
                    $('#delete<%= entityClass %>Confirmation').modal('hide');
                    $scope.clear();
                });
        };<% if (searchEngine == 'elasticsearch') { %>

        $scope.search = function () {
            <%= entityClass %>Search.query({query: $scope.searchQuery}, function(result) {
                $scope.<%= entityInstance %>s = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };<% } %>

        $scope.refresh = function () {<% if (pagination != 'infinite-scroll') { %>
            $scope.loadAll();<% } else { %>
            $scope.reset();<% } %>
            $('#save<%= entityClass %>Modal').modal('hide');
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {<% for (fieldId in fields) { %><%= fields[fieldId].fieldName %>: null, <% } %>id: null};
            $scope.editForm.$setPristine();
            $scope.editForm.$setUntouched();
        };<% if (fieldsContainBlob) { %>

        $scope.formatBase64String = function (base64String) {
            if (!angular.isString(base64String)) {
                return base64String;
            }
            function endsWith(suffix, str) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
            }
            function paddingSize(base64String) {
                if (endsWith('==', base64String)) {
                    return 2;
                }
                if (endsWith('=', base64String)) {
                    return 1;
                }
                return 0;
            }
            var bytes = base64String.length / 4 * 3 - paddingSize(base64String);
            var size = bytes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " bytes";

            if (base64String.length < 30) {
                return base64String + ' size:' + size;
            }

            return base64String.substring(0, 10) + '...' + base64String.slice(-10) + ' size:' + size;
        };<% } %><% for (fieldId in fields) { if (fields[fieldId].fieldType === 'byte[]') { %>

        $scope.set<%= fields[fieldId].fieldNameCapitalized %> = function ($files, <%= entityInstance %>) {
            if ($files[0]) {
                var file = $files[0];
                var fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.onload = function (e) {
                    var data = e.target.result;
                    var base64Data = data.substr(data.indexOf('base64,') + 'base64,'.length);
                    $scope.$apply(function() {
                        <%= entityInstance %>.<%= fields[fieldId].fieldName %> = base64Data;
                    });
                };
            }
        };<% } } %>
    });
