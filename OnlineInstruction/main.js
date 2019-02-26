  $(".BoardBrowserListTaplet .lia-browser-category-heading").unbind('click').click(function(e) {
    e.preventDefault();
    $(this).toggleClass("active").next().slideToggle(200);
  });

// main accordion script
var lastitem = "";
  var allPanels = $(".accordion > dd").hide();

  $(".accordion > dt > a").click(function() {
    allPanels.slideUp();
    if ($(this).text() != lastitem) {
      $(this)
        .parent()
        .next()
        .slideDown();
      lastitem = $(this).text();
    } else {
      lastitem = "";
    }
    return false;
  });


// <@liaAddScript>
// ;(function($){

//   $(".BoardBrowserListTaplet .lia-browser-category-heading").unbind('click').click(function(e) {
//     e.preventDefault();
//     $(this).toggleClass("active").next().slideToggle(200);
//   });

// })(LITHIUM.jQuery);
// </@liaAddScript>