

export default function Listen(document, canvas) {



    var movement = {
        up: false,
        down: false,
        left: false,
        right: false,
        mousex: 0,
        mousey: 0,
        angle: 0
    };

    function updateDirection(x, y) {
        return Math.atan2(y - canvas.height / 2, x - canvas.width / 2);
    }

    canvas.addEventListener('touchmove', function (event) {
        console.log("entered")
        event.preventDefault();
        const touch = event.touches[0];
        movement.angle = updateDirection(touch.clientX, touch.clientY);
    })

    canvas.addEventListener('touchstart', function (event) {
        event.preventDefault();
        const touch = event.touches[0];
        const direction = updateDirection(touch.clientX, touch.clientY);
        //right
        if (direction > -Math.PI / 8 && direction < 0 || direction > 0 && direction < Math.PI / 8) {
            movement.right = true;
            movement.down = false;
            movement.left = false;
            movement.up = false;
        }
        //down right
        else if (direction > Math.PI / 8 && direction < 3 * Math.PI / 8) {
            movement.right = true;
            movement.down = true;
            movement.left = false;
            movement.up = false;
        }
        //down
        else if (direction > 3 * Math.PI / 8 && direction < 5 * Math.PI / 8) {
            movement.right = false;
            movement.down = true;
            movement.left = false;
            movement.up = false;
        }
        //down left
        else if (direction > 5 * Math.PI / 8 && direction < 7 * Math.PI / 8) {
            movement.right = false;
            movement.down = true;
            movement.left = true;
            movement.up = false;
        }
        //left
        else if (direction < Math.PI && direction > 7 * Math.PI / 8 || direction > -Math.PI && direction < -7 * Math.PI / 8) {
            movement.right = false;
            movement.down = false;
            movement.left = true;
            movement.up = false;
        }
        //up left
        else if (direction > -7 * Math.PI / 8 && direction < -5 * Math.PI / 8) {
            movement.right = false;
            movement.down = false;
            movement.left = true;
            movement.up = true;
        }
        //up
        else if (direction > -5 * Math.PI / 8 && direction < -3 * Math.PI / 8) {
            movement.right = false;
            movement.down = false;
            movement.left = false;
            movement.up = true;
        }
        //up right
        else if (direction > -3 * Math.PI / 8 && direction < -Math.PI / 8) {
            movement.right = true;
            movement.down = false;
            movement.left = false;
            movement.up = true;
        }

    })

    document.addEventListener("mousemove", function (event) {
        movement.mousex = event.clientX;
        movement.mousey = event.clientY;
        movement.angle = updateDirection(movement.mousex, movement.mousey);
    });

    document.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 65: // A
                movement.left = true;
                break;
            case 87: // W
                movement.up = true;
                break;
            case 68: // D
                movement.right = true;
                break;
            case 83: // S
                movement.down = true;
                break;
        }
    });

    document.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 65: // A
                movement.left = false;
                break;
            case 87: // W
                movement.up = false;
                break;
            case 68: // D
                movement.right = false;
                break;
            case 83: // S
                movement.down = false;
                break;
        }
    });
    return movement;
}