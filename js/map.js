class Map{
	size   = { x : 0 , y : 0 };
	cells  = [];
	constructor( sizeX , sizeY , array ) {
		this.cells  = array;
		this.size.x = sizeX;
		this.size.y = sizeY;
	}
	GetMapKey( x , y ) {
		return Math.floor( y ) * ( this.size.x ) + Math.floor( x );
	}
	CheckCell( vector3f ) {
		let key = this.GetMapKey( vector3f.x , vector3f.z );
		if( typeof( this.cells[ key ] ) == "undefined" ) return 0;
		return this.cells[ key ];
	}
}