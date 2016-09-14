! function() {
    "use strict";
    angular.module("public", ["ngAnimate", "ngCookies", "ngSanitize", "ui.router", "ui.bootstrap", "toastr", "ngFileUpload", "ngResource"])
}(),
function() {
    "use strict";
    angular.module("public").factory("status", ["$resource", function(e) {
        return {
            SenseStatus: e("api/status/:senseId", {}, {}),
            AllModuleStatus: e("api/status/:senseId/modules", {}, {}),
            ModuleStatus: e("api/status/:senseId/modules/:moduleId", {}, {})
        }
    }])
}(),
function() {
    "use strict";

    function e() {
        function e(e, t, s, n, i) {
            function l() {
                t.SenseStatus.get({
                    senseId: i.sense.senseId
                }, function(e) {
                    i.sense.deviceStatus = e.status
                })
            }
            i.logButtonText = "View", i.expandButtonText = "+", i.showModules = !1, i.showLogViewer = !1, n(l, 1e4), i.getSenseStatus = l, i.getModules = function() {
                s.Modules.get({
                    senseId: i.sense.senseId
                }, function(e) {
                    i.modules = angular.fromJson(e.result), i.moduleCount = i.modules.length
                })
            }, i.displayModules = function() {
                "+" == i.expandButtonText ? i.expandButtonText = "-" : "-" == i.expandButtonText && (i.expandButtonText = "+"), i.showModules = !i.showModules
            }, i.displayLog = function() {
                "View" == i.logButtonText ? i.logButtonText = "Hide" : i.logButtonText = "View", i.showLogViewer = !i.showLogViewer
            }, i.deleteSense = function(t) {
                confirm("Do you want to delete " + t + " ?") && e.delDevice(t)
            }
        }
        e.$inject = ["deviceList", "status", "moduleList", "$interval", "$scope"];
        var t = {
            restrict: "A",
            replace: !0,
            template: function(e, t) {
                return "true" == t.gridView ? '<div ng-include src="dynamicTemplateUrl"></div>' : '<tbody ng-include src="dynamicTemplateUrl"></tbody>'
            },
            scope: {
                senseId: "@",
                imgId: "@",
                deviceStatus: "="
            },
            link: function(e, t, s) {
                e.dynamicTemplateUrl = "app/components/senseItem/senseItem-list.html", e.sense = {}, s.$observe("senseId", function(t) {
                    e.sense.senseId = t, e.getModules(), e.getSenseStatus()
                }), s.$observe("imgId", function(t) {
                    e.sense.imgId = t
                }), s.$observe("gridView", function(t) {
                    e.gridView = t, "true" == e.gridView ? e.dynamicTemplateUrl = "app/components/senseItem/senseItem-grid.html" : e.dynamicTemplateUrl = "app/components/senseItem/senseItem-list.html"
                })
            },
            controller: e,
            controllerAs: "senseItemController",
            bindToController: !0
        };
        return t
    }
    angular.module("public").directive("ngSenseItem", e)
}(),
function() {
    "use strict";

    function e() {
        function e(e, s, n, i) {
            var l = this;
            l.getDevices = e.getDevices, l.delDevice = e.delDevice, l.viewButtonClick = function() {
                i.info("org scope.gridView: " + s.gridView), s.gridView = !s.gridView
            }, l.open = function() {
                var s = n.open({
                    animation: 1,
                    templateUrl: "addModalContent.html",
                    controller: t,
                    controllerAs: "vm"
                });
                s.result.then(function(t) {
                    e.setDevice(t.id, t.imgId), i.info("Generating sense id: " + t.id + ", imageId:" + t.imgId)
                }, function() {
                    i.info("Modal dismissed at: " + new Date)
                })
            }
        }

        function t(e) {
            var t = this;
            t.imgId = 10 + Math.floor(54 * Math.random()), t.senseId = "", t.ok = function() {
                e.close({
                    id: t.senseId,
                    imgId: t.imgId
                })
            }, t.cancel = function() {
                e.dismiss("cancel")
            }
        }
        e.$inject = ["deviceList", "$scope", "$modal", "$log"], t.$inject = ["$modalInstance"];
        var s = {
            restrict: "E",
            template: '<ng-include src="dynamicTemplateUrl"></ng-include>',
            scope: {
                creationDate: "="
            },
            link: function(e, t, s) {
                e.dynamicTemplateUrl = "app/components/senseContent/senseContent-list.html", s.$observe("viewType", function(t) {
                    "grid" == t ? e.gridView = "true" : e.gridView = "false"
                }), e.$watch("gridView", function(t) {
                    e.gridView = t, "true" == e.gridView ? e.dynamicTemplateUrl = "app/components/senseContent/senseContent-grid.html" : e.dynamicTemplateUrl = "app/components/senseContent/senseContent-list.html"
                })
            },
            controller: e,
            controllerAs: "vm",
            bindToController: !0
        };
        return s
    }
    angular.module("public").directive("ngSenseContent", e)
}(),
function() {
    "use strict";

    function e() {
        function e() {}
        var t = {
            restrict: "E",
            templateUrl: "app/components/navbar/navbar.html",
            scope: {
                creationDate: "="
            },
            controller: e,
            controllerAs: "vm",
            bindToController: !0
        };
        return t
    }
    angular.module("public").directive("ngNavbar", e)
}(),
function() {
    "use strict";

    function e() {
        function e(e, t, s, n) {
            function i() {
                s.sense.senseId && s.sense.moduleId && t.ModuleStatus.get({
                    senseId: s.sense.senseId,
                    moduleId: s.sense.moduleId
                }, function(e) {
                    s.sense.moduleStatus = e.status
                })
            }
            s.showLogViewer = !1, n(i, 1e4), s.getModuleStatus = i, s.displayLog = function() {
                s.showLogViewer = !s.showLogViewer
            }, s.deleteModule = function(t, n) {
                confirm("Do you want to delete module [" + n + "] for sense [" + t + "] ?") && e.Module["delete"]({
                    senseId: s.sense.senseId,
                    moduleId: s.sense.moduleId
                }, function() {
                    s.$parent.getModules()
                })
            }
        }
        e.$inject = ["moduleList", "status", "$scope", "$interval"];
        var t = {
            restrict: "A",
            replace: !0,
            template: function(e, t) {
                return "true" == t.gridView ? '<div ng-include src="dynamicTemplateUrl"></div>' : '<tbody ng-include src="dynamicTemplateUrl"></tbody>'
            },
            scope: {
                senseId: "@",
                moduleId: "@",
                moduleStatus: "="
            },
            link: function(e, t, s) {
                e.dynamicTemplateUrl = "app/components/moduleItem/moduleItem-list.html", e.sense = {}, s.$observe("senseId", function(t) {
                    e.sense.senseId = t, e.getModuleStatus()
                }), s.$observe("moduleId", function(t) {
                    e.sense.moduleId = t, e.getModuleStatus()
                }), s.$observe("gridView", function(t) {
                    e.gridView = t, "true" == e.gridView ? e.dynamicTemplateUrl = "app/components/moduleItem/moduleItem-grid.html" : e.dynamicTemplateUrl = "app/components/moduleItem/moduleItem-list.html"
                })
            },
            controller: e,
            controllerAs: "moduleItemController",
            bindToController: !0
        };
        return t
    }
    angular.module("public").directive("ngModuleItem", e)
}(),
function() {
    "use strict";

    function e() {
        function e(e, t) {
            t.getModules = function() {
                e.Modules.get({
                    senseId: t.senseId
                }, function(e) {
                    t.modules = angular.fromJson(e.result), t.moduleEmpty = 0 == t.modules.length
                })
            }
        }
        e.$inject = ["moduleList", "$scope"];
        var t = {
            restrict: "E",
            replace: !0,
            template: '<ng-include src="dynamicTemplateUrl"></ng-include>',
            scope: {
                creationDate: "=",
                modules: "=",
                senseId: "@"
            },
            link: function(e, t, s) {
                e.dynamicTemplateUrl = "app/components/moduleContent/moduleContent-list.html", s.$observe("senseId", function(t) {
                    e.senseId = t, e.getModules()
                }), s.$observe("gridView", function(t) {
                    e.gridView = t, "true" == e.gridView ? e.dynamicTemplateUrl = "app/components/moduleContent/moduleContent-grid.html" : e.dynamicTemplateUrl = "app/components/moduleContent/moduleContent-list.html"
                })
            },
            controller: e,
            controllerAs: "moduleContentController",
            bindToController: !0
        };
        return t
    }
    angular.module("public").directive("ngModuleContent", e)
}(),
function() {
    "use strict";

    function e(e, t) {
        function s() {
            return l
        }

        function n(s, n) {
            e({
                method: "POST",
                url: "api/registerDevice",
                data: {
                    senseId: s,
                    senseIcon: n
                }
            }).then(function(e) {
                t.info(e)
            }, function(e) {
                t.info(e)
            }), l[s] = n
        }

        function i(t) {
            e({
                method: "DELETE",
                url: "api/devices/" + t
            }), delete l[t]
        }
        var l = {};
        e({
            method: "GET",
            url: "api/devices"
        }).then(function(e) {
            var t = angular.fromJson(e.data.result);
            t.forEach(function(e) {
                l[e.senseId] = e.senseIcon
            })
        }, function(e) {
            t.info(e)
        }), this.getDevices = s, this.setDevice = n, this.delDevice = i
    }
    e.$inject = ["$http", "$log"], angular.module("public").service("deviceList", e)
}(),
function() {
    "use strict";
    angular.module("public").factory("moduleList", ["$resource", function(e) {
        return {
            Modules: e("api/devices/:senseId/modules", {}, {}),
            Module: e("api/devices/:senseId/modules/:moduleId", {}, {})
        }
    }])
}(),
function() {
    "use strict";

    function e(e, t, s) {
        var n = this;
        n.senseId = s.senseId
    }
    e.$inject = ["$scope", "$state", "$stateParams"], angular.module("public").controller("ModuleController", e)
}(),
function() {
    "use strict";

    function e(e, t, s) {
        function n() {
            t(function() {
                l.classAnimation = "rubberBand"
            }, 4e3)
        }

        function i() {
            s.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>'), l.classAnimation = ""
        }
        var l = this;
        l.viewType = "grid" == e.viewType ? "grid" : "list", l.awesomeThings = [], l.classAnimation = "", l.creationDate = 1445587798203, l.showToastr = i, n()
    }
    e.$inject = ["$stateParams", "$timeout", "toastr"], angular.module("public").controller("MainController", e)
}(),
function() {
    "use strict";

    function e(e) {
        e.debug("runBlock end")
    }
    e.$inject = ["$log"], angular.module("public").run(e)
}(),
function() {
    "use strict";

    function e(e, t) {
        e.state("think", {
            url: "/think",
            templateUrl: "app/node-red/node-red.html"
        }).state("sense", {
            url: "/sense/:viewType",
            templateUrl: "app/main/main.html",
            controller: "MainController",
            controllerAs: "main"
        }).state("module", {
            url: "/module/:senseId",
            templateUrl: "app/main/module/module.html",
            controller: "ModuleController",
            controllerAs: "module"
        }).state("404", {
            url: "/404",
            templateUrl: "app/exception/404.html"
        }), t.when("", "/sense/list"), t.when("/sense", "/sense/list"), t.otherwise("404")
    }
    e.$inject = ["$stateProvider", "$urlRouterProvider"], angular.module("public").config(e)
}(),
function() {
    "use strict"
}(),
function() {
    "use strict";

    function e(e, t) {
        e.debugEnabled(!0), t.allowHtml = !0, t.timeOut = 3e3, t.positionClass = "toast-top-right", t.preventDuplicates = !0, t.progressBar = !0
    }
    e.$inject = ["$logProvider", "toastrConfig"], angular.module("public").config(e)
}(), angular.module("public").run(["$templateCache", function(e) {
    e.put("app/exception/404.html", '<div class="container"><h1 style="text-align: center">404 NOT FOUND</h1></div>'), e.put("app/node-red/node-red.html", '<div class="node-red-box"><iframe src="node-red/" width="100%" height="100%" scrolling="no" frameborder="0"></iframe></div>'), e.put("app/main/main.html", '<div class="container-fluid"><div class="container"><ng-sense-content view-type="{{main.viewType}}"></ng-sense-content></div></div>'), e.put("app/components/moduleContent/moduleContent-grid.html", '<div class="sense-container"><div class="row"><div ng-module-item="" class="col-md-4" ng-repeat="key in modules" module-id="{{ key }}" sense-id="{{ senseId }}" grid-view="true"></div></div><div class="row empty-text" ng-show="moduleEmpty">You have not yet registered any Humix Sense.</div></div>'), e.put("app/components/moduleContent/moduleContent-list.html", '<table class="table"><thead></thead><tbody ng-module-item="" ng-repeat="key in modules" module-id="{{ key }}" sense-id="{{ senseId }}" grid-view="false"></tbody><tbody ng-show="moduleEmpty"><tr><td colspan="6" class="empty-text">You have not yet registered any modules yet.</td></tr></tbody></table>'), e.put("app/components/moduleItem/moduleItem-grid.html", '<div class="panel panel-default"><div class="row panel-heading"><div class="col-md-10">{{sense.moduleId}}</div><div class="col-md-2"><input type="image" src="assets/images/trash.png" ng-click="deleteModule(sense.senseId, sense.moduleId)"></div></div><div class="panel-body"><div class="row"><div class="col-md-4"><img ng-src="assets/images/humix_on.png" class="img-thumbnail" alt="thumbnail"></div><div class="col-md-8"><br><div><div class="sense-status-icon-cell"><div class="sense-status-{{ sense.moduleStatus }}"></div></div><div class="sense-status-text-cell">{{ sense.moduleStatus }}</div></div></div></div></div></div>'), e.put("app/components/moduleItem/moduleItem-list.html", '<tr><th scope="row" class="vert-align"></th><td class="vert-align">{{sense.moduleId}}</td><td class="vert-align"></td><td class="vert-align"><div class="sense-status-icon-cell"><div class="sense-status-{{ sense.moduleStatus }}"></div></div><div class="sense-status-text-cell">{{ sense.moduleStatus }}</div></td><td class="vert-align"></td><td class="vert-align"><input type="image" src="assets/images/trash.png" ng-click="deleteModule(sense.senseId, sense.moduleId)"></td></tr>'), e.put("app/components/navbar/navbar.html", '<div class="row" id="header"><div class="col-md-2"><div class="logo-img pull-left"><img src="assets/images/IBM_IoT_cloud2.png" width="117px"></div></div><div class="col-md-4"><div class="logo-text"><h1>HUMIX THINK</h1></div></div><div class="col-md-6 header-options"><ul class="list-inline breadcrumbs"><li><a ui-sref="sense">Sense</a></li><li><a ui-sref="think">Think</a></li></ul></div></div>'), e.put("app/components/senseContent/senseContent-grid.html", '<div class="sense-container"><div class="sense-btn-container"><div class="title"><button class="btn btn-default btn-add-sense" ng-click="vm.open()">Add Sense</button></div><div class="title sense-btn-container"><a ui-sref="sense({viewType: \'list\'})"><img class="btn btn-default btn-view" src="assets/images/tableView.png"></a></div></div><br><div class="row"><div ng-sense-item="" class="col-md-4" ng-repeat="(key, val) in vm.getDevices()" sense-id="{{ key }}" img-id="{{ val }}" grid-view="true"></div></div></div><script type="text/ng-template" id="addModalContent.html"><div class="modal-header"> <h3 class="modal-title">Add Sencse</h3> </div> <div class="modal-body"> <form class="form-horizontal"> <div class="form-group"> <div class="col-sm-3 modal-thumbnail-block"> <img width="60" height="60" border="1" ng-src="assets/images/robot-icon-list/{{ vm.imgId }}.png" class="img-thumbnail" alt="thumbnail" /> </div> <label class="col-sm-1 control-label" for="sense-id">ID: </label> <div class="col-sm-8"> <input type="text" id="sense-id" class="form-control" placeholder="Humix-Godzilla" ng-model="vm.senseId"/> </div> </div> </form> </div> <div class="modal-footer"> <button class="btn btn-primary" type="button" ng-click="vm.ok()">OK</button> <button class="btn btn-warning" type="button" ng-click="vm.cancel()">Cancel</button> </div></script>'), e.put("app/components/senseContent/senseContent-list.html", '<div class="sense-container"><div class="sense-btn-container"><div class="title"><button class="btn btn-default btn-add-sense" ng-click="vm.open()">Add Sense</button></div><div class="title sense-btn-container"><a ui-sref="sense({viewType: \'grid\'})"><img class="btn btn-default btn-view" src="assets/images/gridView.png"></a></div></div><br><div class="row"><table class="table"><thead class="thead-inverse"><tr><th></th><th>Sense ID</th><th>Status</th><th>Modules</th><th>Remove</th></tr></thead><tbody ng-sense-item="" ng-repeat="(key, val) in vm.getDevices()" sense-id="{{ key }}" img-id="{{ val }}"></tbody></table></div></div><script type="text/ng-template" id="addModalContent.html"><div class="modal-header"> <h3 class="modal-title">Add Sencse</h3> </div> <div class="modal-body"> <form class="form-horizontal"> <div class="form-group"> <div class="col-sm-3 modal-thumbnail-block"> <img width="60" height="60" border="1" ng-src="assets/images/robot-icon-list/{{ vm.imgId }}.png" class="img-thumbnail" alt="thumbnail" /> </div> <label class="col-sm-1 control-label" for="sense-id">ID: </label> <div class="col-sm-8"> <input type="text" id="sense-id" class="form-control" placeholder="Humix-Godzilla" ng-model="vm.senseId"/> </div> </div> </form> </div> <div class="modal-footer"> <button class="btn btn-primary" type="button" ng-click="vm.ok()">OK</button> <button class="btn btn-warning" type="button" ng-click="vm.cancel()">Cancel</button> </div></script>'), e.put("app/components/senseItem/senseItem-grid.html", '<div class="panel panel-default"><div class="row panel-heading"><div class="col-md-10"><a ui-sref="module({senseId: sense.senseId})">{{sense.senseId}}</a></div><div class="col-md-2"><input type="image" src="assets/images/trash.png" ng-click="deleteSense(sense.senseId)"></div></div><div class="panel-body"><div class="row"><div class="col-md-4"><a ui-sref="module({senseId: sense.senseId})"><img width="60" height="60" border="1" ng-src="assets/images/robot-icon-list/{{ sense.imgId }}.png" class="img-thumbnail" alt="thumbnail"></a></div><div class="col-md-8"><br><div><div class="sense-status-icon-cell"><div class="sense-status-{{ sense.deviceStatus }}"></div></div><div class="sense-status-text-cell">{{ sense.deviceStatus }}</div></div></div></div></div></div>'), e.put("app/components/senseItem/senseItem-list.html", '<tr><th scope="row" class="vert-align"><img width="60" height="60" border="1" ng-src="assets/images/robot-icon-list/{{ sense.imgId }}.png" class="img-thumbnail" alt="thumbnail"></th><td class="vert-align"><button ng-click="displayModules()">{{expandButtonText}}</button> {{sense.senseId}}</td><td class="vert-align"><div class="sense-status-icon-cell"><div class="sense-status-{{ sense.deviceStatus }}"></div></div><div class="sense-status-text-cell">{{ sense.deviceStatus }}</div></td><td class="vert-align">{{moduleCount}}</td><td class="vert-align"><input type="image" src="assets/images/trash.png" ng-click="deleteSense(sense.senseId)"></td></tr><tr ng-show="showModules"><td class="no-top-border"></td><td colspan="4" class="no-top-border"><ng-module-content sense-id="{{ sense.senseId }}" grid-view="false"></ng-module-content></td></tr>'), e.put("app/main/module/module.html", '<div class="container-fluid"><div class="container"><h1>{{module.senseId}}</h1><ng-module-content sense-id="{{module.senseId}}" grid-view="true"></ng-module-content></div></div>')
}]);
//# sourceMappingURL=../maps/scripts/app-24602f1703.js.map