'use strict';

var rec = require('./rec'),
    lane = require('./lane'),
    jsonmlParse = require('./create-element'),
    parseConfig = require('./parse-config'),
    parseWaveLanes = require('./parse-wave-lanes'),
    renderMarks = require('./render-marks'),
    renderGaps = require('./render-gaps'),
    renderGroups = require('./render-groups'),
    renderWaveLane = require('./render-wave-lane'),
    renderAssign = require('./render-assign'),
    renderReg = require('./render-reg'),
    renderArcs = require('./render-arcs'),
    insertSVGTemplate = require('./insert-svg-template'),
    insertSVGTemplateAssign = require('./insert-svg-template-assign');

function findFirstChildByTagName (parent, name) {
    var i;
    var arr = parent.children;
    var ilen = arr.length;
    for (i = 0; i < ilen; i++) {
        if (arr[i].tagName === name) {
            return arr[i];
        }
    }
}

function renderWaveElement (index, source, outputElement, waveSkin) {
    if (source.signal) {

        insertSVGTemplate(index, outputElement, source, lane, waveSkin);
        parseConfig(source, lane);

        var ret = rec(source.signal, {'x':0, 'y':0, 'xmax':0, 'width':[], 'lanes':[], 'groups':[]});

        var svgcontent  = outputElement.children[0];
        var waves = findFirstChildByTagName (svgcontent, 'g');
        var lanes = waves.children[0];
        var groups = waves.children[1];

        var content  = parseWaveLanes(ret.lanes, lane);
        var glengths = renderWaveLane(lanes, content, index, lane);

        var xmax = glengths.reduce(function (res, len, i) {
            return Math.max(res, len + ret.width[i]);
        }, 0);

        renderMarks(lanes, content, index, lane);
        renderArcs(lanes, ret.lanes, index, source, lane);
        renderGaps(lanes, ret.lanes, index, lane);
        groups.insertBefore(jsonmlParse(renderGroups(ret.groups, index, lane)), null);
        lane.xg = Math.ceil((xmax - lane.tgo) / lane.xs) * lane.xs;
        var width = (lane.xg + (lane.xs * (lane.xmax + 1)));
        var height = (content.length * lane.yo + lane.yh0 + lane.yh1 + lane.yf0 + lane.yf1);

        svgcontent.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svgcontent.setAttribute('width', width);
        svgcontent.setAttribute('height', height);
        svgcontent.setAttribute('overflow', 'hidden');
        lanes.setAttribute('transform', 'translate(' + (lane.xg + 0.5) + ', ' + ((lane.yh0 + lane.yh1) + 0.5) + ')');
    } else if (source.assign) {
        insertSVGTemplateAssign(index, outputElement, source);
        renderAssign(index, source);
    } else if (source.reg) {
        renderReg(index, source, outputElement);
    }
}

module.exports = renderWaveElement;
