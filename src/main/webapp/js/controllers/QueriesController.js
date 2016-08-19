/*******************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2011, 2013 OpenWorm.
 * http://openworm.org
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the MIT License
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *      OpenWorm - http://openworm.org/people.html
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 *******************************************************************************/
/**
 * Controller responsible to execute queries
 *
 * @author Matteo Cantarelli
 */
define(function (require) {
    return function (GEPPETTO) {

        /**
         * @class GEPPETTO.QueriesController
         */
        GEPPETTO.QueriesController =
        {

            /**
             *
             * * Run a set of queries on this datasource
             *
             * @param queries
             * @param callback
             */
            runQuery: function (queries, callback) {
                var compoundQuery=[];
                for (var i=0;i<queries.length;i++) {
                    compoundQuery.push({queries[i].target.getPath(), queries[i].query.getPath()});
                }

                var parameters = {};
                parameters["projectId"] = Project.getId();
                parameters["query"] = compoundQuery;

                var c=callback;
                GEPPETTO.MessageSocket.send("run_query", parameters, function(data){
                	var queryResults=JSON.parse(data)["return_query_results"];
                	if(c!=undefined){
                		c(queryResults);
                	}
                });
            },


            /**
             * Get the count for a set of queries on this datasource
             *
             * @param queries
             * @param callback
             */
            getQueriesCount: function (queries, callback) {
                var compoundQuery=[];
                for (var i=0;i<queries.length;i++) {
                    compoundQuery.push({queries[i].target.getPath(), queries[i].query.getPath()});
                }

                var parameters = {};
                parameters["projectId"] = Project.getId();
                parameters["query"] = compoundQuery;

                var c=callback;
                GEPPETTO.MessageSocket.send("run_query_count", parameters, function(data){
                	var count=JSON.parse(data)["return_query_count"];
                	if(c!=undefined){
                		c(count);
                	}
                });
            }
        }
    }

});
