$("#campground-search").on("input", function () {
  var search = $(this).serialize();
  if (search === "search=") {
    search = "all";
  }
  $.get("/campgrounds?" + search, function (data) {
    $("#campground-grid").html("");
    data.forEach(function (campground) {
      $("#campground-grid").append(`
        <div class="col-md-6 col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="100">
          <div class="block-campgrounds text-left">
            <a href="#"><img class="img-responsive" src="${
              campground.image
            }" alt="${campground.name}"></a>
            <div class="content-campgrounds">
              <h4><a href="/campgrounds/${
                campground._id
              }">${campground.name}</a></h4>
              <div class="description">
                <p>${campground.description.substring(0, 100)}...</p>
              </div>
              <span><em>Submitted by <a href="/users/${
                campground.author._id
              }">${campground.author.username}</a></em></span>
              <a class="pull-right readmore" href="/campgrounds/${
                campground._id
              }">read more</a>
            </div>
          </div>
      `);
    });
  });
});

$("#campground-search").submit(function (event) {
  event.preventDefault();
});
