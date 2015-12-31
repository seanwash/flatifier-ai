var doc = app.activeDocument,
  docPath = doc.path,
  destination,
  holderDoc;

function stepThroughAndExportLayers(layers) {
  var layer,
    numLayers = layers.length;

  for(var i = 0; i < numLayers; i++) {
    layer = layers[i];

    copyLayerTo(layer);
    selectAll(holderDoc);
    holderDoc.fitArtboardToSelectedArt(0);
    exportFiles(layer);
    holderDoc.activeLayer.pageItems.removeAll();
  }

  holderDoc.close(SaveOptions.DONOTSAVECHANGES);
}

copyLayerTo = function(layer) {
  var pageItem,
    numPageItems = layer.pageItems.length;

  for (var i = 0; i < numPageItems; i++) {
    pageItem = layer.pageItems[i];
    pageItem.duplicate(holderDoc.activeLayer, ElementPlacement.PLACEATEND);
  }
};

selectAll = function() {
  var pageItems = holderDoc.pageItems,
    numPageItems = holderDoc.pageItems.length;

  for (var i = 0; i < numPageItems; i += 1) {
    pageItems[i].selected = true;
  }
};

validateLayerName = function(value, separator) {
  separator = separator || '_';

  return value.toLowerCase().replace(/\s/, separator);
};

function exportFiles(layer) {
  var name = validateLayerName(layer.name, '-');

  pngpath = new File(destination + '/' + name + '@1x.png');
  savePNG(pngpath, 100.0);

  pngpath = new File(destination + '/' + name + '@2x.png');
  savePNG(pngpath, 200.0);

  pngpath = new File(destination + '/' + name + '@3x.png');
  savePNG(pngpath, 300.0);

  pngpath = new File(destination + '/' + name + '@4x.png');
  savePNG(pngpath, 400.0);

  svgpath = new File(destination + '/' + name + '.svg');
  saveSVG(svgpath);

  psdpath = new File(destination + '/' + name + '.psd');
  savePSD(psdpath);

  pdfpath = new File(destination + '/' + name + '.pdf');
  savePDF(pdfpath);
}

function savePNG(file, scale) {
  var exp = new ExportOptionsPNG24();
  exp.transparency = true;
  exp.horizontalScale = scale;
  exp.verticalScale = scale;

  // export as SAVE-FOR-WEB
  holderDoc.exportFile(file, ExportType.PNG24, exp);
}

function saveSVG(file) {
  var exp = new ExportOptionsSVG();
  exp.compressed = true;
  exp.includeFileInfo = true;
  exp.embedRasterImages = true;

  holderDoc.exportFile(file, ExportType.SVG);
}

function savePSD(file) {
  var exp = new ExportOptionsPhotoshop();

  holderDoc.exportFile(file, ExportType.PHOTOSHOP);
}

function savePDF(file) {
  var exp = new PDFSaveOptions();
  exp.compatibility = PDFCompatibility.ACROBAT6;
  exp.generateThumbnails = true;
  exp.preserveEditability = false;
  exp.acrobatLayers = false;

  holderDoc.saveAs(file, exp);
}

(function() {
  destination = Folder.selectDialog('Select or create output folder.', docPath);

  if (!destination) { return; }

  holderDoc = app.documents.add(DocumentColorSpace.RGB);
  stepThroughAndExportLayers(doc.layers);
}());
