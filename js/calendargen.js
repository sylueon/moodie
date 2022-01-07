//sets a variable for today
const now = new Date();

//general settings - theme, mood colors & stickers
const settings = {
  theme: "light",
  moodBg: {
    depressed: "#C7CEEA",
    anxious: "#B5EAD7",
    sad: "#E2F0CB",
    okay: "#FFDAC1",
    happy: "#FFB7B2",
    amazing: "#FF9AA2"
  },
  stickers: {
    period: "https://cdn.discordapp.com/attachments/813440421879087134/927852951727407134/1fa78.png",
    sweat: "https://cdn.discordapp.com/attachments/813440421879087134/927852500952965130/1f4a6.png",
    bed: "https://cdn.discordapp.com/attachments/813440421879087134/927852390332370944/1f6cf.png",
    sad: "https://cdn.discordapp.com/attachments/813440421879087134/927851978774708264/1f622.png",
    sun: "https://cdn.discordapp.com/attachments/813440421879087134/927851496790446080/2600.png",
    heart: "https://cdn.discordapp.com/attachments/813440421879087134/927851396324286484/2764.png",
    sparkle: "https://cdn.discordapp.com/attachments/813440421879087134/927851239981604896/2728.png"
  }
}

//retrieve local storage and convert to object or create a new object
const getStorage = () => {
  let monthStorage;
  if (localStorage.getItem('moodStorage')) {
    const getStorage = localStorage.getItem('moodStorage');
    monthStorage = JSON.parse(getStorage);    
  } else {
      const year = now.getFullYear();
      const monthName = now.toLocaleString('default', {month: 'long'});

    monthStorage = {
      month: monthName,
      year: year,
      days: []
    }    
  }
  return monthStorage;
}

const toggleCalendarVisibility = (status) => {
  if (status === "hide") {
    document.querySelector("#monthHeader").classList.add("hidden");
    document.querySelector("#daysOfWeek").classList.add("hidden");
    document.querySelector("#calendarDays").classList.add("hidden");
  } else {
    document.querySelector("#monthHeader").classList.remove("hidden");
    document.querySelector("#daysOfWeek").classList.remove("hidden");
    document.querySelector("#calendarDays").classList.remove("hidden");
  }
}

//class to store daily info
class trackerDay {
  constructor(date, mood, goodThings, sticker, rating) {
    this.date = date;
    this.mood = mood;
    this.goodThings = goodThings;
    this.sticker = sticker;
    this.rating = rating;
  }
}

//converts default getDay() to shift to monday being 0 and sunday being 6 (instead of sunday being 0)
//thanks to https://javascript.info/task/calendar-table 
 function getDay(date) { // get day number from 0 (monday) to 6 (sunday)
  let day = date.getDay();
  if (day == 0) day = 7; // make Sunday (0) the last day
  return day - 1;
}

//element maker for each day of the calendar
function dayMaker(el, id, innerText, appendTo) {
  //generic element creation
  const element = document.createElement(el);
  element.innerText = innerText;
  element.id = id;
  
  //get the stored data
  const storage = getStorage();

  //if there is data stored for the day clicked, generate the page with further info
  if(storage.days[id] && !(storage.days[id].sticker == "" && storage.days[id].mood == "" && storage.days[id].goodThings == "" && storage.days[id].rating == "")) {
    //gets the sticker img url
    const sticker = storage.days[id].sticker;

    if (sticker != "") {
      const stickerImg = settings.stickers[sticker];    

      //HTML for how the day looks on calendar
      element.innerHTML = `<div>${innerText}</div><div class='ms-auto mt-auto calSticker' style='background:url(${stickerImg});'></div>`;
    }
    
    //linear gradient for mood
    const mood = storage.days[id].mood;

    if(mood.length > 0) {
      const moodMap = mood.map((a) => settings.moodBg[a]);
      const moodMapString = moodMap.toString();   

      if (mood.length > 1) {      
        element.style.background = `linear-gradient(to bottom right, ${moodMapString})`;
      } else {
        element.style.background = `linear-gradient(to bottom right, transparent, ${moodMapString})`;
      }
      element.style.borderColor = "rgba(255,255,255,0.5)";
    }
    

    //click leads into page with details about that day
    element.addEventListener("click", () => {
      //remove the fade-in class from the calendar so it can be retriggered when added back
      document.querySelector("#calendar").classList.remove("fade-in");
      
      //make the tab to contain the details
      let div;
      if (!document.querySelector("#dayTab")) {
        div = document.createElement("div");
          div.id = "dayTab";
          div.classList.add("fade-in");
        document.querySelector("main").append(div);
      } else {
        div = document.querySelector("#dayTab");
        div.classList.add("fade-in");
      }

      //hide the calendar boys for now
      toggleCalendarVisibility("hide");
      
      //get date from object and convert to full date
      const day = new Date(`${storage.days[id].date}`).toLocaleDateString([],{dateStyle: "full"});

      //put that date in the header
      const header = document.createElement("header");
        header.innerHTML = `<h2 class="d-flex px-3 justify-content-between">
          <a href="#" class="text-white btn" id="back"><<</a>
          <span>${day}</span>
        </h2> `;
      div.append(header);

      //brings back the calendar (+fade-in class to initiate fade in animation)
      header.querySelector("#back").addEventListener("click", () => {
        //erase the details div + remove fade-in class
        div.innerHTML = "";
        div.classList.remove("fade-in");

        //show the calendar + add fade-in class to toggle the animation
        toggleCalendarVisibility("show");        
        document.querySelector("#calendar").classList.add("fade-in");
      });


      let moodText = ``;
      let ratingText = ``;
      let goodThingsText = ``;
      if (mood.length > 0) {
        //parse the mood for the details page
        const parsedMood = storage.days[id].mood.reverse().toString().replace(/,(?=[^,]*$)/, " & ").replace(/,/g, ", ");
        moodText = `<p class="text-center">Today, my mood was ${parsedMood}.</p>`;
      }

      if (storage.days[id].rating) {
        ratingText = `<p class="text-center">Out of 10, I'd say it was a ${storage.days[id].rating}.</p>`;
      }
      
      if (storage.days[id].goodThings) {
        goodThingsText = `<h3 class="mt-5">3 Good Things that happened:</h3>
          <p class="ps-4">${storage.days[id].goodThings}</p>`;
      }
      

      //creates the details in article element for the details page
      const article = document.createElement("article");
        article.id = "dayDescArticle";
        article.classList = "d-flex"
        article.innerHTML = `
        <div class="p-4 my-auto w-100" id="dayTabDesc" style="position: relative;">          
          
          ${moodText}
          ${ratingText}
          
          ${goodThingsText}

          <div class="descImg" style="background:url(${settings.stickers[sticker]}) no-repeat;"></div>

          <div class="text-center mt-5" id="editDayDiv">
            <a href="#" id="editDay" data-bs-toggle="modal" data-bs-target="#modal">Not accurate? Edit me!</a>
          </div>
        </div>
        `;
      div.append(article);

      //adds event listener to fill in the details
      article.querySelector("#editDay").addEventListener("click", () => {
        //reset the modal form
        document.querySelector("form[name=moodForm]").reset();

        //assign the date for the date input element
        const dateEl = document.querySelector("input[id=date]");
        const inputDate = new Date(now.getFullYear(), now.getMonth(), id+1);
        dateEl.value = inputDate.toISOString().substr(0,10);

        //assigns the rating, 3 good things and sticker to fill form
        document.querySelector("input[id=rating]").value = storage.days[id].rating;
        document.querySelector("textarea[id=threeThings]").value = storage.days[id].goodThings;
        if (storage.days[id].sticker) {           
          document.querySelector(`input[value=${storage.days[id].sticker}]`).checked = true;
        }

        
        storage.days[id].mood.forEach((m) => {          
          console.log(m)
          if(document.querySelector(`input[value=${m}]`)) {
            document.querySelector(`input[value=${m}]`).checked = true;
          }
        })

        div.innerHTML = "";
        toggleCalendarVisibility("show");
      }) 

    })
  } else {
    element.addEventListener("click", () => {
      document.querySelector("form[name=moodForm]").reset();
      const dateEl = document.querySelector("input[id=date]");
      const inputDate = new Date(now.getFullYear(), now.getMonth(), id+1);
      dateEl.value = inputDate.toISOString().substr(0,10);
    })    
    element.setAttribute("data-bs-toggle", "modal");
    element.setAttribute("data-bs-target", "#modal");
  }

  
  appendTo.append(element);
}

function setCalendar() {  
  const main = document.querySelector("main");
      main.style.opacity = "1";

  document.querySelector("#calendarDays").innerHTML = "";
  const year = now.getFullYear();
  const month = now.getMonth();

  //set Month header
  const monthName = now.toLocaleString('default', {month: 'long'});
  const header = document.querySelector('h2');
  header.innerText = `${monthName}, ${year}`;
  
  //set first and last days of the month
  const firstDayOfMonth = new Date(year, month);
  const lastDayOfMonth = new Date(year, month+1, 0);

  const calDays = document.querySelector('#calendarDays');

  let blanks = 0;
  for (let i=0; i < getDay(firstDayOfMonth); i++) {
    blanks = i+1;
  }

  console.log(blanks);

  const noOfWeeks = Math.ceil((lastDayOfMonth.getDate()+blanks) / 7);
  for (let i=0; i < noOfWeeks; i++) {
      const week = document.createElement('div');
      week.classList = "week";
        week.id = "week"+(i);
      calDays.append(week);

      if (i==0 && blanks != 0) {
          for (let k=0; k < blanks; k++) {
            const article = document.createElement('article');
            week.append(article);
          }
        }

      for (let j=1; j <= lastDayOfMonth.getDate(); j++) {
        if (i == 0 && week.childElementCount < 7 && (j+(i*7)) <= lastDayOfMonth.getDate()) {
          let day = j+ (i*7);
          dayMaker('article',day,day,week);
        } else if (week.childElementCount < 7 && (j+(i*7))  - blanks <= lastDayOfMonth.getDate()) {
          let day = j+ (i*7) - blanks;
          dayMaker('article',day,day,week);
        } else if (week.childElementCount < 7) {
          const blankArticle = document.createElement('article');
          week.append(blankArticle);
        }
      }

    }
  }

  

const storage = getStorage();

if (storage.month === now.toLocaleString('default', {month: 'long'})) {
  setCalendar();
} else {
  let modal = new bootstrap.Modal(document.querySelector("#newMonthModal"), {});
  modal.show();
}



const moodObject = () => {
  const date = document.querySelector("#date").value;
  const rating = document.querySelector("#rating").value;
  
  const mood = document.querySelectorAll("input[type=checkbox]");  
  const getMoodArray = Array.from(mood, (a) => {
     if (a.checked) {return a.value}
    });
  const moodArray = getMoodArray.filter ((e) => e != null);

  const goodThings = document.querySelector("#threeThings").value;

  const sticker = document.querySelectorAll("input[name=sticker]");  
  let checkedSticker = "";
  sticker.forEach((a) => {
     if (a.checked) {checkedSticker = a.value}
    });

  return new trackerDay(date, moodArray, goodThings, checkedSticker, rating);  
}

document.querySelector("#save").addEventListener("click", () => {    
  let dayStore = moodObject();

  const date = document.querySelector("#date").value;
    let num = parseInt(date.substr(8,10),10);

  let monthStorage = getStorage();  
    monthStorage.days[num] = dayStore;    
    localStorage.setItem('moodStorage', JSON.stringify(monthStorage));
    
    setCalendar();
  })

  document.querySelector("#eraseAll").addEventListener("click", () => {    
    localStorage.clear();
    setCalendar()
  });

  document.querySelector("#noSave").addEventListener("click", () => {    
    localStorage.clear();
    setCalendar()
  });

  //from https://medium.com/@danny.pule/export-json-to-csv-file-using-javascript-a0b7bc5b00d2 + https://codepen.io/danny_pule/pen/WRgqNx
 function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilename = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function download(){
  var headers = {
      date: 'Date',
      mood: "Mood",
      goodThings: "Good Things",
      sticker: "Sticker",
      rating: "Rating"
  };

  getMood = JSON.parse(localStorage.getItem('moodStorage'));
  getDays = getMood.days;

  itemsNotFormatted = getMood.days;

  var itemsFormatted = [];

  itemsNotFormatted.forEach((item) => {
    if (item != null) {
      item.mood = item.mood.reverse().toString().replace(/,(?=[^,]*$)/, " & ").replace(/,/g, ", ");
    }
  });
  
  // format the data
  itemsNotFormatted.forEach((item) => {
    if (item != null) {
      itemsFormatted.push({
          date: `"${item.date}"`, // remove commas to avoid errors,
          mood: `"${item.mood}"`,
          goodThings: `"${item.goodThings.replace(/"/gim,"'")}"`,
          sticker: `"${item.sticker}"`,
          rating: `"${item.rating}"`
      });
    }      
  });

  var fileTitle = `${getMood.year}_${getMood.month}`; // or 'my-unique-title'

  exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}
