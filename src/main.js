'use strict';
/* global require */

var d3 = require('d3');
var $ = require('jquery');

var elem = $('#visualization');
var width;
var height;
var margin = {top: 10, left: 10, bottom: 10, right: 10};

var blockWidth;
var blockMargin = 2;

var matrix;


var svg = d3.select(elem[0]).append('svg')
    .attr('width', width)
    .attr('height', height);

function initMatrix(n, m, gapPenalty) {
    var cols = n + 1;
    var rows = m + 1;
    matrix = [];
    width = elem.width();
    blockWidth = (width - margin.right - margin.left) / cols;

    for (var i = 0; i < rows; i++) {
        matrix.push([]);
        for (var j = 0; j < cols; j++) {
            var val = null;

            if (i === 0) {
                val = j * gapPenalty;
            } else if (j === 0) {
                val = i * gapPenalty;
            }

            matrix[i].push(val);
        }
    }

    console.log(matrix);

    svg
        .attr('width', width)
        .attr('height', blockWidth * m + margin.top + margin.bottom);
}

initMatrix(10, 6, -4);
