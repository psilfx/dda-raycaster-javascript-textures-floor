//Массива для кэша, значения которые надо расчитать, но они всегда одинаковые
const pixelPointerXCache  = [];
const pixelPointerYCache  = [];
const floorViewDistCache  = [];
const heightDistanceCache = [];
/**
 ** @desc Отрисовка значений рейкастера
 **/
class Draw {
	frameImage;
	framePixels;
	zBuffer = [];
	shadowColor = new Color( 0 , 0 , 0 );
	wallColor  = new Color(); //Цвет стены
	floorColor = new Color(); //Цвет пола
	skyColor   = new Color( 168 , 217 , 255 ); //Цвет неба
	constructor() {
		this.stride      = canvas.width * 4;
		for( let y = 0; y < canvas.height; y++ ) {
			pixelPointerYCache[ y ] = y * this.stride;
		}
		for( let x = 0; x < canvas.width; x++ ) {
			pixelPointerXCache[ x ] = x * 4;
		}
		for( let w = 0; w <= width; w++ ) {
			let rayAngle = -fovHalf + fovStep * w;
			floorViewDistCache[ w ] = [];
			for( let y = 0; y <= heightH; y++ ) {
				floorViewDistCache[ w ][ y ] = viewDist / ( ( viewDist - ( y * heightStep ) ) * Math.cos( rayAngle ) ) / floorAspect;
			}
		}
		for( let y = 0; y < heightH; y++ ) {
			heightDistanceCache[ y ] = y / heightH;
		}
	}
	/**
	 ** @desc Заполняет буфер кадра входными данными
	 **/
	InitBuffer() {
		this.frameImage  = context.getImageData( 0 , 0 , canvas.width , canvas.height );
		this.framePixels = this.frameImage.data;
	}
	/**
	 ** @desc Проверяет по збуфферу и пишет пиксель в массив на вывод
	 ** @vars (int) x - координата x отсносительно экрана, (int) y - координата y отсносительно экрана, (Color) color - цвет на заполнение, (int) z - координата z для проверки по буфферу
	 **/
	SetFramePixel( x , y , color , z = 0 ) {
		let pixelPointer = pixelPointerYCache[ y ] + pixelPointerXCache[ x ];
		//if( this.zBuffer[ pixelPointer ] > z ) return;
		this.zBuffer[ pixelPointer ]         = z;
		this.framePixels[ pixelPointer ]     = color.r;
		this.framePixels[ pixelPointer + 1 ] = color.g;
		this.framePixels[ pixelPointer + 2 ] = color.b;
		this.framePixels[ pixelPointer + 3 ] = color.a;
	}
	/**
	 ** @desc Рисует небо
	 **/
	DrawSky() {
		context.fillStyle = this.skyColor.ToString();
		context.fillRect( 0 , 0 , width , heightH );
	}
	/**
	 ** @desc Рисует пол
	 **/
	DrawFloor() {
		for( let y = 0; y < heightH; y++ ) {
			let dist    = y / heightH;
			let	color   = this.floorColor.Multiply( dist );
				color.a = 1;
			this.DrawLine( { x : 0 , z : heightH + y } , { x : width , z : heightH + y } , color.ToString() );
		}
	}
	/**
	 ** @desc Рисует линию
	 ** @vars (Vecto3F) start - начало линии, (Vecto3F) end - конец линии, (Color) color - цвет линии
	 **/
	DrawLine( start , end , color ) {
		context.strokeStyle = color;
		context.strokeWidth = 1;
		context.beginPath();
		context.moveTo( start.x + 0.5 , start.z ); //0.5 для сдвига, чтобы избежать смешивания
		context.lineTo( end.x + 0.5 , end.z );
		context.stroke();
		context.closePath();
	}
	/**
	 ** @desc Рисует стену
	 ** @vars (int) w - номер пикселя по ширине экрана, (float) distance - дистанция до стены, полученная от каста луча
	 **/
	DrawWall( w , distance ) {
		let wallHeight = Math.min( parseInt( camDepth / ( distance ) ) , height ) * 0.5;	
		let distBlack  = 1 - distance / viewDist;
		let	color      = this.wallColor.Multiply( distBlack );
			color.a    = 1;
		this.DrawLine( { x : w , z : heightH - wallHeight } , { x : w , z : heightH + wallHeight } , color.ToString() );
	}
	/**
	 ** @desc Рисует стену
	 ** @vars (int) w - номер пикселя по ширине экрана, (float) distance - дистанция до стены, полученная от каста луча, (int) textureId - ключ текстуры в массиве текстур, (int) textureX - позиция полоски пикселей по x
	 **/
	DrawTexturedWall( w , distance , textureId , textureX ) {
		let wallHeight  = Math.min( parseInt( camDepth / distance ) , maxHeight );
		let wallHeightH = parseInt( wallHeight >> 1 ); //Деление на 2
		let distBlack   = distance / viewDist;
		let	color       = this.shadowColor.Copy();
			color.a     = distBlack;
		let texture     = textures[ textureId ];
		context.drawImage( textures[ textureId ].img , textureX , 0 , 1 , textSize , w , heightH - wallHeightH , 1 , wallHeight );
		this.DrawLine( { x : w , z : heightH - wallHeightH } , { x : w , z : heightH + wallHeightH } , color.ToString() );
		return wallHeightH;
	}
	/**
	 ** @desc Рисует буфер кадра на холст
	 **/
	Draw() {
		context.putImageData( this.frameImage , 0 , 0 );
	}
	/**
	 ** @desc Рисует пол
	 ** @vars (int) x - полоса экрана по ширине с лева на право, (int) floorStart - y откуда начинается отрисовка пола
	 **/
	DrawTexturedFloor( x , floorStart ) {
		// Рисуем пол
		let texture = textures[ 4 ];
		//Вычисляем шаг для текстуры
		let rayAngle = -fovHalf + fovStep * x;
		let angle = cameraAngle + rayAngle;
		for ( let y = 0; y <= heightH - floorStart; y++ ) {
			// Вычисляем расстояние до пола
			let rowDistance = floorViewDistCache[ x ][ y ];
			let hDistX = rowDistance * Math.cos( angle ) + cameraPosition.x;
			let hDistY = rowDistance * Math.sin( angle ) + cameraPosition.z;
			// Текущие координаты текстуры
			let textureX = parseInt( Math.abs( hDistX - Math.floor( hDistX ) ) * textSize ) ;
			let textureY = parseInt( Math.abs( hDistY - Math.floor( hDistY ) ) * textSize ) ;
			// Получаем цвет из текстуры пола
			let pixelData = texture.GetRGBAPixel( textureX , textureY );
			let dist      = 1 - heightDistanceCache[ y ];
				pixelData.a  = 255;
			this.SetFramePixel( x , height - y , { r: dist * pixelData.r , g: dist * pixelData.g , b : dist * pixelData.b , a : pixelData.a } );
		}
	}
}