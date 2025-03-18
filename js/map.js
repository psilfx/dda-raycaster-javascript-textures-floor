/**
 ** @desc Класс работы с картой уровня
 **/
class Map{
	size   = { x : 0 , y : 0 };
	cells  = [];
	/**
	 ** @desc Создаёт карту с размерами x на y 
	 ** @vars (int) sizeX - клетки карты, (int) sizeY - клетки карты, (array) array - масив с заполненными клетками
	 **/
	constructor( sizeX , sizeY , array ) {
		this.cells  = array;
		this.size.x = sizeX;
		this.size.y = sizeY;
	}
	/**
	 ** @desc Разбивает на основные составляющие DDA алгоритма и возвращает их
	 ** @vars (int) x - клетки карты, (int) y - клетки карты
	 **/
	GetMapKey( x , y ) {
		return Math.floor( y ) * ( this.size.x ) + Math.floor( x );
	}
	/**
	 ** @desc Проверяет клетку на наличие стены
	 ** @vars (vector3f) вектор для проверки x и y
	 **/
	CheckCell( vector3f ) {
		let key = this.GetMapKey( vector3f.x , vector3f.z );
		if( typeof( this.cells[ key ] ) == "undefined" ) return 0;
		return this.cells[ key ];
	}
}