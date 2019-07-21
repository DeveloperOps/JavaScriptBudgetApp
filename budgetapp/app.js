//budget controller
var budgetController = (function() {

	var Expense = function(id , description , value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome)*100);
		}else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id , description , value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});
		data.totals[type] = sum;
	}

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		}, 
		budget: 0,
		percentage: -1
	}

	return {
		addItem: function(type , des , val){
			var newItem , ID;
			// create new id
			if(data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}else {
				ID = 0;
			}
			
			//create new item based on inc or exp
			if(type === 'exp'){
				newItem = new Expense(ID , des , val);
			}else if(type === 'inc') {
				newItem = new Income(ID , des , val);
			}
			// push the data into datastructure
			data.allItems[type].push(newItem);
			//returning the new item
			return newItem;
		},

		deleteItem: function(type , id){
			//lets say id= 6
			//data.allItems[type][id];
			//Ids = [1,4,5,7,9]
			//index = 3
			var Ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			var index = Ids.indexOf(id);
			if(index !== -1) {
				//then we want to delete element
				//method splice used to remove elements
				data.allItems[type].splice(index , 1);
			}

		},
		
		calculateBudget: function() {
			 // Calculate total income and expenses
			 calculateTotal('exp');
			 calculateTotal('inc');
			 //calculate the budget: income - expenses
			 data.budget = data.totals.inc - data.totals.exp;
			 //calculate the percent of income that we spent
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);	 
			}else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current){
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPercentages = data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
			return allPercentages;
		},

		getBudget: function(){
			return {
				budget: data.budget,
				totalIncome: data.totals.inc,
				totalExpense: data.totals.exp,
				percentage: data.percentage
			}
		},
		test: function() {
			console.log(data)
		}
	};



})();

//ui controller
var uiController = (function() {
   var DomStrings = {
	   inputType: '.add__type',
	   inputDescription: '.add__description',
	   inputValue: '.add__value',
	   inputBtn: '.add__btn',
	   incomeContainer: '.income__list',
	   expensesContainer: '.expenses__list',
	   budgetLabel: '.budget__value',
	   incomeLabel: '.budget__income--value',
	   expensesLabel: '.budget__expenses--value',
	   percentageLabel: '.budget__expenses--percentage',
	   container: '.container',
	   expPerLabel: '.item__percentage',
	   dateLabel: '.budget__title--month'
   }

   var formatNumber = function(num , type) {
	var numSplit , int , dec;
	num = Math.abs(num);
	num=  num.toFixed(2);

	numSplit = num.split('.');
	int = numSplit[0];
	if(int.length > 3) {
		int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3 ,3); //input 2310 , output 2,310
	}
	dec = numSplit[1];
	return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' + dec;
};

var nodeListForEach = function(list , callback) {
	for(var i=0; i<list.length; i++) {
		callback(list[i] , i);
	}
}

  return {
	  getInput: function(){
		  return {
		   type: document.querySelector(DomStrings.inputType).value, //will be eiter inc or expenses
		   description: document.querySelector(DomStrings.inputDescription).value,
			//parse float converts string to number
		   value: parseFloat(document.querySelector(DomStrings.inputValue).value)
		  };
		},

		addListItem: function(obj , type){
			var html , newHtml , element;
			//create html string with placeholder string
			if(type === 'inc') {
			element = DomStrings.incomeContainer;
			html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type === 'exp') {
			element = DomStrings.expensesContainer;
			html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			//replace placeholder text with actual data by using replace method
			newHtml = html.replace('%id%' , obj.id);
			newHtml = newHtml.replace('%description%' , obj.description);
			newHtml = newHtml.replace('%value%' , formatNumber(obj.value , type));
			//insert the html into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
			},

			deleteListItem: function(selectorID) {
				//removing the element --removeChild method
				var element = document.getElementById(selectorID);
				//bit strange : - / but only how this works
				element.parentNode.removeChild(element);

			},

			clearfeilds: function(){
				var fields,fieldArr;
				fields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);
				// queryselectorall not returns an array it returns a list so we have to convert feilds into array
				fieldArr = Array.prototype.slice.call(fields);
				// clearing all after press enter or clicking the add button
				fieldArr.forEach(function(current , indexno , array) {
					current.value = "";
				});
				fieldArr[0].focus();
			},

			displayBudget: function(obj) {
				var type;

				obj.budget > 0? type = 'inc' : type = 'exp';
				document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget , type);
				document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalIncome , 'inc');
				document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExpense , 'exp');
				if(obj.percentage > 0) {
					document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
				}else {
					document.querySelector(DomStrings.percentageLabel).textContent = '--';
				}
			}, 

			displayPercentages: function(percentages) {
				var feilds = document.querySelectorAll(DomStrings.expPerLabel);
				
				nodeListForEach(feilds , function(current , index) {
					if(percentages[index] > 0){
						current.textContent = percentages[index] + '%';
					}else {
						current.textContent = '---';
					}
					
				});
			},

			displayMonth: function() {
				var now = new Date();
				var year = now.getFullYear();
				var months = ['Jan' , 'Feb' , 'Mar' , 'Apr' , 'May' , 'June' , 'July' , 'Aug' , 'Sept' , 'Oct' , 'Nov', 'Dec'];
				var month = now.getMonth();
				document.querySelector(DomStrings.dateLabel).textContent = months[month] +' '+year;
			},
			
			changedType: function() {
				var fields = document.querySelectorAll(
					DomStrings.inputType + ',' + DomStrings.inputDescription + ',' + DomStrings.inputValue
				);

				nodeListForEach(fields , function(current) {
					current.classList.toggle('red-focus');
				});

				document.querySelector(DomStrings.inputBtn).classList.toggle('red');

			},
		//exposing domstrings so that excessble outside
		getDomStrings: function() {
			return DomStrings;
		}
  }
})();

//global controller
var controller = (function(budgetCtrl , uictrl) {

	var setUpEventListners = function() {
		var DOM = uictrl.getDomStrings();

		document.querySelector(DOM.inputBtn).addEventListener('click' ,ctrlAddItem);
		document.addEventListener('keypress' , function(event){
			if(event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click' , ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change' , uictrl.changedType);
	}

	 

	var updateBudget = function() {
				
		//1> calculate the budget
		budgetCtrl.calculateBudget();
		//2> Return the budget
		var budget = budgetCtrl.getBudget();
		//3> display the budget on the ui
		uictrl.displayBudget(budget);
		
	};

	var updatePercentages = function() {
		//calcluate percentage
		budgetCtrl.calculatePercentages();
		//read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();
		//update the ui with the new percentages
		uictrl.displayPercentages(percentages);
	};


	var ctrlAddItem = function(){ 
		var input , newItem; 
		//1> Get the feild input data
		input = uictrl.getInput();	
		if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
		//2>add item to the budget controller
		newItem = budgetCtrl.addItem(input.type , input.description , input.value);
		//3> add the item to the ui
		uictrl.addListItem(newItem , input.type);
		// 4> clear the feilds
		uictrl.clearfeilds();
		//5> Calculate and update budget
		updateBudget();
		//6> Calculate and update percentages
		updatePercentages();
		} 
	};

	var ctrlDeleteItem = function(event) {
		var itemID ,splitID , type , ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID) {
			// inc - 1 spliting string
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//1- delete item from datastructure
			budgetCtrl.deleteItem(type , ID);
			// 2- delete item from ui
			uictrl.deleteListItem(itemID);
			//3 update and show new budget
			updateBudget();
			//4> Calculate and update percentages
			updatePercentages();
		}
	};
	return {
		init: function() {
			console.log('app started');
			uictrl.displayMonth();
			uictrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpense: 0,
				percentage: -1
			});
			setUpEventListners();
		} 
	}
})(budgetController , uiController);

controller.init();