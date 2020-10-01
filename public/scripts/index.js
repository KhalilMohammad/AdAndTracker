"use strict";

$(function () {
  const table = $("#tblResults").DataTable({
    paging: false,
    ordering: false,
    info: false,
    processing: false,
    searching: false,
  });

  const socket = io();

  $("#btnSubmit").click(function () {
    const urls = $("#urls")
      .val()
      .split("\n")
      .filter((i) => i);
    $.ajax({
      type: "POST",
      url: "/",
      data: JSON.stringify(urls),
      contentType: "application/json",
      dataType: "json",
    }).done(function () {
      table.clear();
    });
  });

  socket.on("onDataRecieve", function (element) {
    table.row
      .add([
        element.domain,
        element.adsUrl.length,
        element.thirdPartyTrackers.length,
        (element.timeInMs / 1000).toFixed(2) + " sec",
      ])
      .draw();
  });
});
