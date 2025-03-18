/**
 ** @desc Сам рейкастер
 **/
class Raycaster {
	/**
	 ** @desc Основной метод, пускает луч по заданному углу и возвращает расстояние, если луч достиг цели или вылетел за пределы карты
	 ** @vars (float) rayAngle - угол луча в радианах
	 **/
	Cast( rayAngle ) {
		//Входные данные
		let textureId = 0;
		let { direction , delta , start , distance , step , side } = this.DDARay( rayAngle , cameraPosition.Copy() );
		for( let d = 0; d < viewDist; d++ ) {
			//Двигаемся к следующей клетке
			if ( distance.x < distance.z ) {
				distance.x += delta.x;
				start.x    += step.x;
				side        = 0;
			} else {
				distance.z += delta.z;
				start.z    += step.z;
				side        = 1;
			}
			//Проверяем, попали ли в стену
			textureId = level.CheckCell( start ); //Либо 0 либо id текстуры
			if ( start.x < 0 || start.z < 0 || start.x >= level.size.x || start.z >= level.size.y || textureId ) {
				if( start.x < 0 || start.z < 0 || start.x > level.size.x || start.z > level.size.y ) textureId = 0;
				let outdistance = ( side ) ? ( start.z - cameraPosition.z + ( ( 1 - step.z ) >> 1 ) ) / direction.z : ( start.x - cameraPosition.x + ( ( 1 - step.x ) >> 1 ) ) / direction.x;
				return [ outdistance , side , textureId ];
			}
		}
		return 0;
	}
	/**
	 ** @desc Разбивает на основные составляющие DDA алгоритма и возвращает их
	 ** @vars (float) rayAngle - угол луча в радианах, (Vecto3F) rayCast - старт каста луча
	 **/
	DDARay( rayAngle , rayCast ) {
		//Направление луча
		let direction = new Vector3F( Math.cos( rayAngle ) , 0 , Math.sin( rayAngle ) );
		//Шаг DDA, расстояние по x и z(y)
		let delta     = new Vector3F( Math.abs( 1 / direction.x ) , 0 , Math.abs( 1 / direction.z ) );
		//Старт луча
		let start     = new Vector3F( Math.floor( rayCast.x ) , 0 , Math.floor( rayCast.z ) );
		//Стартовое  расстояние
		let distance  = new Vector3F();
		//Шаг по клетке
		let step      = new Vector3F();
		//Определяем начальные шаги и расстояния
		if ( direction.x < 0) { //Луч идёт влево
			step.x = -1;
			distance.x = ( rayCast.x - start.x ) * delta.x;
		} else {
			step.x = 1;
			distance.x = ( ( start.x + 1) - rayCast.x ) * delta.x;
		}
		if ( direction.z < 0) { //Луч идёт вверх
			step.z = -1;
			distance.z = ( rayCast.z - start.z ) * delta.z;
		} else {
			step.z = 1;
			distance.z = ( ( start.z + 1 ) - rayCast.z ) * delta.z;
		}
		//Сторона, горизонталь / вертикаль
		let side = 0;
		return { direction , delta , start , distance , step , side };
	}
	/**
	 ** @desc Возвращает вектор по переданным длине и углу
	 ** @vars (float) dist - длина луча, (float) angle - угол луча
	 **/
	CreateVectorFromAngle( dist , angle ) {
		return new Vector3F( dist * Math.cos( angle ) , 0 , dist * Math.sin( angle ) );
	}
}