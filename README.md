## N-Gon
> Looks like a cube, acts like a cube, but isn't a cube at all.

### Getting Started
Of course pull the script down and import it into your projects. Script is located at:
`app/js/n-gon.js` or `dist/js/n-gon.js`

I'll make a bower repo if this thing goes anywhere.

### Creation
`nGon.init(id, data);`
- id: String of the element's id you want the cube to appear inside
- data: Array of objects or HTML strings. 

nGon is able to handle 2-dimensional arrays, but the 2nd dimension can only have 3 elements. The cube can have infinite faces, but each face can only have 3 poly's. Don't want people to get lost in your data.

### Destruction
`nGon.destroy();`

### Flip API
`nGon.flip();`  
`nGon.flip('forward'); or nGon.flip('left');`  
`nGon.flip('backward'); or nGon.flip('right');`  
`nGon.flip('up');`  
`nGon.flip('down');`   

### Adding data
`nGon.append();`
Can be an HTML string or an Array

### Events
```
nGon.flipEnd(function(direction, facesObject){
    console.log(direction, facesObject);
});
```
Calls your anymous function with the direction and current set of faces.

### Access
`nGon.getFaces();`
Returns the DOM nodes and state information for the current faces on the cube.

