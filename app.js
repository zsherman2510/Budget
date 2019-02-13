// Budget Controller
const budgetController = (function() {

  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  
  let data = {
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
  };

  return {
    addItem: function(type, des, val) {
      let newItem, ID;
      // Create new ID
      
      if (data.allItems[type].length > 0) {
          ID = data.allItems[type][data.allItems[type].length - 1 ].id + 1;
      } else {
        ID = 0;
      }
       

      // Create a new Item with inc or exp
      if (type === 'exp') {
          newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
          newItem = new Income(ID, des, val);
      }
      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new Item
      return newItem;
    },

    deleteItem: function(type, id) {
      let ids = data.allItems[type].map(function(current) {
        return current.id;

      });
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function (){
      // calc total income and expense
      calculateTotal('exp');
      calculateTotal('inc');


      // calc the budget income- expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calc percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100);
        } else {
        data.percentage = -1;

      }



    },

    calculatePercentages: function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      let allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      console.log(data); 
    }

  };



  
})();

//UI controller
const UIController = (function() {

  var DOMstrings = {
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
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'

  };

  let formatNumber = function (num, type) {
    let numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.')
    int = numSplit[0];

    if(int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+')
    + ' ' + int + '.' + dec;
  };

  let nodeListforEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };


  return {
    getInput: function(){
      return {
         type: document.querySelector(DOMstrings.inputType).value, // inc or exp
         description: document.querySelector(DOMstrings.inputDescription).value, //descrip
         value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // the number // parsefloat turns value into a number
      };
    },

    addListItem: function(obj, type) {
      let html, newHTML;
      // Create HTML string with placeholder text
      if(type === 'inc') {

        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix"id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {

        element = DOMstrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Replace the placeholder text with data
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));


      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function(selectorID){
      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },
    //to delete input fields after adding item to list
    clearFields: function() {

      let fields; 

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      // turn the fields into an array
      fieldsArr = Array.prototype.slice.call(fields);

      // the arguments that we enter in the UI
      fieldsArr.forEach(function(currVal, index, array) {
        currVal.value = "";

      });

      // sets the focus back to description
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

      if (obj.percentage > 0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +'%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }


    },

    displayPercentages: function(percentages) {

      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListforEach(fields, function(current, index) {

        if (percentages[index] > 0){
            current.textContent = percentages[index] + '%';

        } else {
          current.textContent = '---';
        }
        
      });


    },
    displayMonth: function() {
      let now, months, month, year;
      now = new Date();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December'];
;     month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    changedType: function(){
      let fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

      nodeListforEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();


// Global app controller
const controller = (function(budgetCtrl, UICtrl) {


  let setupEventListeners = function() {

    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }

    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };




  let updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    let budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
   UICtrl.displayBudget(budget);
  };

  let updatePercentages = function() {
    // 1. calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read the percentages from the budget controller
    let percentages = budgetCtrl.getPercentages();
    // 3. Display the percentages
    UICtrl.displayPercentages(percentages);
  };

  let ctrlAddItem = function () {

    let input, newBudgetItem;
    
    // 1. Get the filled input data
    input = UICtrl.getInput();

    //tests to see if the input value is valid
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

    // 2. Add the item to the budget controller
    newBudgetItem = budgetCtrl.addItem(input.type, input.description, input.value);
    // 3. Add the item to the UI
    UICtrl.addListItem(newBudgetItem, input.type);

    // 4. Clear the fields
    UICtrl.clearFields();

    // 5. calculate and update budget
    updateBudget();

    // 6. calculate and update percentages
    updatePercentages();
    }
    
  };

  const ctrlDeleteItem = function(event){
    let itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID)
      // 2. delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // 3. update and show the new budget
      updateBudget();
      // 4. calculate and update percentages
      updatePercentages();

      
    }
  };

  return {
    init: function() {
      console.log('Application has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });

      setupEventListeners();
    }
  };


})(budgetController, UIController);

controller.init();