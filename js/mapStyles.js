/**** CartoCSS for styling tax lot data ****/
var app = app || {};

app.mapStyles = (function(){
  return {
    
    // Category style, warning letters orange / civil penalties red
    // all : "#allwarnings_dc {" +
    //                          "marker-fill-opacity: 0.9;" +
    //                          "marker-line-color: #FFF;" +
    //                          "marker-line-width: 1;" +
    //                          "marker-line-opacity: 1;" +
    //                          "marker-placement: point;" +
    //                          "marker-type: ellipse;" +
    //                          "marker-width: 10;" +
    //                          "marker-allow-overlap: true;" +
    //                       "}" +

    //       '#allwarnings_dc[decisiontype="Civil Money Penalty"] {marker-fill: #B40903;}' +
    //       '#allwarnings_dc[decisiontype="Warning Letter"] {marker-fill: #000000;}',

    // default style, all lots are the same color
    // all : '#allwarnings_dc {' +
    //                               'marker-fill-opacity: 0.9;' +
    //                               'marker-line-color: #FFF;' +
    //                               'marker-line-width: 1;' +
    //                               'marker-line-opacity: 1;' +
    //                               'marker-placement: point;' +
    //                               ' marker-type: ellipse;' +
    //                               'marker-width: 10;' +
    //                               'marker-fill: #FF9900;' +
    //                               'marker-allow-overlap: true;' +
    //                             '}',


    // just warning letters style - orange
    warningLetters : '#warningLetters {' +
                                  'marker-fill-opacity: 0.9;' +
                                  'marker-line-color: #FFF;' +
                                  'marker-line-width: 1;' +
                                  'marker-line-opacity: 1;' +
                                  'marker-placement: point;' +
                                  ' marker-type: ellipse;' +
                                  'marker-width: 10;' +
                                  'marker-fill: #FF9900;' +
                                  'marker-allow-overlap: true;' +
                                '}',

    // just civial penalties style - red
    civilPenalties : '#civilPenalties {' +
                                  'marker-fill-opacity: 0.9;' +
                                  'marker-line-color: #FFF;' +
                                  'marker-line-width: 1;' +
                                  'marker-line-opacity: 1;' +
                                  'marker-placement: point;' +
                                  ' marker-type: ellipse;' +
                                  'marker-width: 10;' +
                                  'marker-fill: #B40903;' +
                                  'marker-allow-overlap: true;' +
                                '}',
    
    // choropleth style based on FDA Contracts                                
    // allContracts : "#allContracts{" +
    //                                     "polygon-fill: #FFFFB2;" +
    //                                     "polygon-opacity: 0.7;" +
    //                                     "line-color: #FFF;" +
    //                                     "line-width: 0.5;" +
    //                                     "line-opacity: 1;" +
    //                                     "}" +
    //                                     '#fda_state_contracts [ most_recent_award_amount <= 4334123] {polygon-fill: #BD0026;}' +
    //                                     '#fda_state_contracts [ most_recent_award_amount <= 3491329.2] {polygon-fill: #F03B20;}' +
    //                                     '#fda_state_contracts [ most_recent_award_amount <= 2648535.4000000004] {polygon-fill: #FD8D3C;}' +
    //                                     '#fda_state_contracts [ most_recent_award_amount <= 1805741.6] {polygon-fill: #FECC5C;}' +
    //                                     '#fda_state_contracts [ most_recent_award_amount <= 962947.8] {polygon-fill: #FFFFB2;}',

                                                                               
  };
})();
