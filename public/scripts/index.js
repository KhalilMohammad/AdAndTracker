"use strict";

$(function () {
  var table = $("#tblResults").DataTable({
    paging: false,
    ordering: false,
    info: false,
    processing: true,
    searching: false,
  });

  $("#btnSubmit").click(function () {
    const urls = $("#urls")
      .val()
      .split("\n")
      .filter((i) => i);
    $(
      ".dataTables_processing",
      $("#tblResults").closest(".dataTables_wrapper")
    ).show();
    $.ajax({
      type: "POST",
      url: "/",
      data: JSON.stringify(urls),
      contentType: "application/json",
      dataType: "json",
    })
      .done((data) => {
        table.clear();
        for (var index = 0; index < data.length; index++) {
          var element = data[index];
          table.row
            .add([
              element.domain,
              element.adsUrl.length,
              element.thirdPartyTrackers.length,
              (element.timeInMs / 1000).toFixed(2) + " sec",
            ])
            .draw();
        }
      })
      .always(function () {
        $(
          ".dataTables_processing",
          $("#tblResults").closest(".dataTables_wrapper")
        ).hide();
      });
  });
});
