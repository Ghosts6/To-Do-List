document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function(){
    document.body.classList.remove('loading');
  }, 1000);
});

tsParticles.load({
  id: "tsparticles",
  options: {
    background: {
      color: "#000000", // Black background matching --main-color
      image: "none", // Remove image
      repeat: "no-repeat",
      size: "40%",
      position: "60% 50%"
    },
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "repulse"
        },
        onHover: {
          enable: true,
          mode: "bubble"
        }
      },
      modes: {
        bubble: {
          distance: 200,
          duration: 2,
          opacity: 0,
          size: 0,
          speed: 3
        },
        repulse: {
          distance: 400,
          duration: 0.4
        }
      }
    },
    particles: {
      color: { value: "#00ff00" }, // Green particles matching --stroke-color
      move: {
        direction: "none",
        enable: true,
        outModes: "out",
        random: true,
        speed: 0.3
      },
      number: {
        density: {
          enable: true
        },
        value: 600
      },
      opacity: {
        animation: {
          enable: true,
          speed: 5
        },
        value: { min: 0.3, max: 0.6 }
      },
      shape: {
        type: "circle"
      },
      size: {
        value: 1
      }
    }
  }
});
