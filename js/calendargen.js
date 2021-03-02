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
    period: "https://discord.com/assets/2af597d88e655d0cce7ff65a50298d70.svg",
    sweat: "https://discord.com/assets/9d7ddcf78b0fdff6ab938077da38401f.svg",
    bed: "https://discord.com/assets/08148db134d007c67675a73a5c89bc19.svg",
    sad: "https://discord.com/assets/f6d30507f4baee759bc9d7e5c0d3ba4f.svg",
    sun: "https://discord.com/assets/1038cee47a0a8313dc2d4006145fcee6.svg",
    heart: "https://discord.com/assets/8544ea5ce32fd9e17df806eb1cfeab47.svg",
    sparkle: "https://discord.com/assets/e820a306c732b90515989dada9995a97.svg"
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
  if(storage.days[id]) {
    //gets the sticker img url
    const sticker = storage.days[id].sticker;
    const stickerImg = settings.stickers[sticker];    

    //HTML for how the day looks on calendar
    element.innerHTML = `<div>${innerText}</div><div class='ms-auto mt-auto calSticker' style='background:url(${stickerImg});'></div>`;

    //linear gradient for mood
    const mood = storage.days[id].mood;
    const moodMap = mood.map((a) => settings.moodBg[a]);
    const moodMapString = moodMap.toString();   

    if (mood.length > 1) {      
      element.style.background = `linear-gradient(to bottom right, ${moodMapString})`;
    } else {
      element.style.background = `linear-gradient(to bottom right, transparent, ${moodMapString})`;
    }
    element.style.borderColor = "rgba(255,255,255,0.5)";

    //click leads into page with details about that day
    element.addEventListener("click", () => {
      // const main = document.querySelector("main");
      document.querySelector("#calendar").classList.remove("fade-in");
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

      document.querySelector("#monthHeader").style.display = "none";
      document.querySelector("#daysOfWeek").style.display = "none";
      document.querySelector("#calendarDays").style.display = "none";

      const day = new Date(`${storage.days[id].date}`).toLocaleDateString([],{dateStyle: "full"});

      const header = document.createElement("header");
        header.innerHTML = `<h2 class="d-flex px-3 justify-content-between">
          <a href="#" class="text-white btn" id="back"><<</a>
          <span>${day}</span>
        </h2> `;
      div.append(header);

      header.querySelector("#back").addEventListener("click", () => {
        div.innerHTML = "";
        document.querySelector("#monthHeader").style.display = "initial";
        document.querySelector("#daysOfWeek").style.display = "flex";
        document.querySelector("#calendarDays").style.display = "initial";
        div.classList.remove("fade-in");
        document.querySelector("#calendar").classList.add("fade-in");
      });

      const parsedMood = storage.days[id].mood.reverse().toString().replace(/,(?=[^,]*$)/, " & ").replace(/,/g, ", ");


      const article = document.createElement("article");
        article.id = "dayDescArticle";
        article.classList = "d-flex"
        article.innerHTML = `
        <div class="p-4 my-auto w-100" id="dayTabDesc" style="position: relative;">          
          
          <p class="text-center">Today, my mood was ${parsedMood}.</p>
          <p class="text-center">Out of 10, I'd say it was a ${storage.days[id].rating}.</p>
          
          <h3 class="mt-5">3 Good Things that happened:</h3>
          <p class="ps-4">${storage.days[id].goodThings}</p>

          <div class="descImg" style="background:url(${settings.stickers[sticker]}) no-repeat;"></div>

          <div class="text-center mt-5" id="editDayDiv">
            <a href="#" id="editDay" data-bs-toggle="modal" data-bs-target="#modal">Not accurate? Edit me!</a>
          </div>
        </div>
        `;
      div.append(article);

      article.querySelector("#editDay").addEventListener("click", () => {
        document.querySelector("form[name=moodForm]").reset();
        const dateEl = document.querySelector("input[id=date]");
          const inputDate = new Date(now.getFullYear(), now.getMonth(), id+1);
          dateEl.value = inputDate.toISOString().substr(0,10);

        document.querySelector("input[id=rating]").value = storage.days[id].rating;
        document.querySelector("textarea[id=threeThings]").value = storage.days[id].goodThings;
        document.querySelector(`input[value=${storage.days[id].sticker}]`).checked = true;
        storage.days[id].mood.forEach((m) => {          
          console.log(m)
          if(document.querySelector(`input[value=${m}]`)) {
            document.querySelector(`input[value=${m}]`).checked = true;
          }
        })

        div.innerHTML = "";
        document.querySelector("#monthHeader").style.display = "initial";
        document.querySelector("#daysOfWeek").style.display = "flex";
        document.querySelector("#calendarDays").style.display = "initial";
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

  