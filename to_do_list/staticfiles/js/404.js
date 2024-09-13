  particlesJS('particles-js', {
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            value_area: 800
          }
        },
        shape: {
          type: 'polygon',
          polygon: {
            nb_sides: 3
          },
          stroke: {
            width: 2,
            color: '#00ff00'
          },
          fill: {
            color: '#0000ff'
          }
        },
        size: {
          value: 10,
          random: true
        },
        line_linked: {
          enable: true,
          color: '#00ff00',
          opacity: 0.6
        },
        move: {
          enable: true,
          speed: 3,
          direction: 'none',
          straight: false,
          out_mode: 'out'
        }
      },
      interactivity: {
        events: {
          onhover: {
            enable: true,
            mode: 'repulse'
          }
        }
      }
    });