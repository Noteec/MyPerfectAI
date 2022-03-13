function DCanvas(el)
		{
			const ctx = el.getContext('2d');
			const pixel = 20;

			let is_mouse_down = false;

			canv.width = 700;
			canv.height = 500;

			this.drawLine = function(x1, y1, x2, y2, color = 'gray') {
				ctx.beginPath();
				ctx.strokeStyle = color;
				ctx.lineJoin = 'miter';
				ctx.lineWidth = 1;
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
			}

			this.drawCell = function(x, y, w, h) {
				ctx.fillStyle = 'blue';
				ctx.strokeStyle = 'blue';
				ctx.lineJoin = 'miter';
				ctx.lineWidth = 1;
				ctx.rect(x, y, w, h);
				ctx.fill();
			}

			this.clear = function() {
				ctx.clearRect(0, 0, canv.width, canv.height);
			}

			this.drawGrid = function() {
				const w = canv.width;
				const h = canv.height;
				const p = w / pixel;

				const xStep = w / p;
				const yStep = h / p;

				for( let x = 0; x < w; x += xStep )
				{
					this.drawLine(x, 0, x, h);
				}

				for( let y = 0; y < h; y += yStep )
				{
					this.drawLine(0, y, w, y);
				}
			}

			this.calculate = function(draw = false) {
				const w = canv.width;
				const h = canv.height;
				const p = w / pixel;

				const xStep = w / p;
				const yStep = h / p;

				const vector = [];
				let __draw = [];

				for( let x = 0; x < w; x += xStep )
				{
					for( let y = 0; y < h; y += yStep )
					{
						const data = ctx.getImageData(x, y, xStep, yStep);

						let nonEmptyPixelsCount = 0;
						for( i = 0; i < data.data.length; i += 10 )
						{
							const isEmpty = data.data[i] === 0;

							if( !isEmpty )
							{
								nonEmptyPixelsCount += 1;
							}
						}

						if( nonEmptyPixelsCount > 1 && draw )
						{
							__draw.push([x, y, xStep, yStep]);
						}

						vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);
					}
				}

				if( draw )
				{
					this.clear();
					this.drawGrid();

					for( _d in __draw )
					{
						this.drawCell( __draw[_d][0], __draw[_d][1], __draw[_d][2], __draw[_d][3] );
					}
				}

				return vector;
			}

			el.addEventListener('mousedown', (e) => {
					is_mouse_down = true;
					ctx.beginPath();
				})

			el.addEventListener('mouseup', (e) => {
					is_mouse_down = false;
				})

			el.addEventListener('mousemove', (e) => {
					if (is_mouse_down) {
						ctx.fillStyle = 'red';
						ctx.strokeStyle = 'red';
						ctx.lineWidth = pixel;

						ctx.lineTo(e.offsetX, e.offsetY);
						ctx.stroke();

						ctx.beginPath();
						ctx.arc(e.offsetX, e.offsetY, pixel / 2, 0, Math.PI * 2);
						ctx.fill();

						ctx.beginPath();
						ctx.moveTo(e.offsetX, e.offsetY);
					}
				})
		}

		let vector = [];
		let net = null;
		let train_data = [];

		const d = new DCanvas(document.getElementById('canv'));

        let clear = document.querySelector('.clear');
		let save = document.querySelector('.save')
		let check = document.querySelector('.check')
		start = document.querySelector('.startb')

		const config = {
			binaryThresh: 0.5,
			hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
			activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
			leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
		  };

            clear.addEventListener('click',() => {
					d.clear();
				});
			save.addEventListener('click',() => {
				vector = d.calculate(true);
				word = prompt('что это?')
				let obj = {
					input: vector,
					output: { [word] : 1}
				};
				train_data.push(obj);	
			})
			check.addEventListener('click',() => {
				net = new brain.NeuralNetwork(config);
				net.train(train_data, { log: true });

				const result = brain.likely(d.calculate(), net);
				alert(result);
			})