var model

console.log('loading coco-ssd model...')
cocoSsd.load().then(function(res){
    alert("Please allow webcam access")
    $("#canvasl").remove();
    model = res
    console.log('done')
    $("#web-cam-btn").attr('title','Ready')
    load_webcam();
},function(){
    //failure
    console.log('loading tf model failed')
});

function draw_bbox(ctx, predictions, font){
    predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        ctx.strokeRect(x, y, width, height);
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });
}

function draw_label(ctx, predictions){
    predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];

        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      });
}

function draw_res_image(canvas, ctx, image, predictions){
    const font = "16px sans-serif";
    
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#00FFFF";

    $('#spinner').hide()
    draw_bbox(ctx, predictions, font)
    draw_label(ctx, predictions)
}

function drawVideoPredictions(predictions){
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    c.width = 700;
    c.height = 500;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
}

var video 
var localstream

function close_stream(){
    video = document.getElementById("video")
    video.pause()
    video.src = ""
    tracks = localstream.getTracks()
    tracks[0].stop();

    setTimeout(function(){
        $('#close-web-cam').addClass('display-none')
        $('#web-cam-btn').removeClass('display-none')
    },1000)
}

function detectFrame() {
    model.detect(video).then(predictions => {
        drawVideoPredictions(predictions)
        if(video.srcObject.active){
            requestAnimationFrame(detectFrame)
        }
    })
  }

function load_webcam(){
    video = document.getElementById("video")
    
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: 700,
          height: 500
        }
      })
      .then(stream => {
        video.srcObject = stream
        localstream = stream
        video.onloadedmetadata = () => {
          video.play()
          $('#web-cam-btn').addClass('display-none')
          $('#close-web-cam').removeClass('display-none')
          detectFrame()
        }
      }, function(){
      })
}
