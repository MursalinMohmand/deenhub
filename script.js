document.addEventListener("DOMContentLoaded", () => {
  const tbd = document.querySelector(".tbd");
  const adDate = document.querySelector(".adDate");
  const hrDate = document.querySelector(".hrDate");
  const curtime = document.querySelector("#time");

  let lon;
  let lat;

  let AdhanData;

  if (tbd && adDate && hrDate && curtime) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          lon = longitude;
          lat = latitude;

          Adhan();
        },
        (error) => {
          console.error("Error getting location:", error.message);
        },
        {
          enableHighAccuracy: true, // Uses GPS if available
          maximumAge: 0, // Do not use a cached location
        },
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }

    const Adhan = async () => {
      const AdhanUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
      const res = await fetch(AdhanUrl);
      AdhanData = await res.json();

      console.log(AdhanData);

      const time = AdhanData.data.timings;

      const date = AdhanData.data.date;

      hrDate.textContent = `${date.hijri.date} AH`;
      adDate.textContent = date.gregorian.date;

      for (let item in time) {
        if (
          item === "Fajr" ||
          item === "Dhuhr" ||
          item === "Asr" ||
          item === "Maghrib" ||
          item === "Isha"
        ) {
          let iconname = "";
          if (item === "Fajr") {
            iconname = "meteocons:sunset";
          } else if (item === "Dhuhr") {
            iconname = "meteocons:time-late-afternoon-fill";
          } else if (item === "Asr") {
            iconname = "meteocons:time-evening-fill";
          } else if (item === "Maghrib") {
            iconname = "meteocons:clear-night";
          } else {
            iconname = "meteocons:starry-night-fill";
          }

          const time12 = convertTo12Hour(time[item]);

          const tr = document.createElement("tr");
          tr.classList.add("border-b-1", "border-gray-100");
          tr.innerHTML = `<td class='p-4'>
                    <div class="text-center flex gap-6 ">
                      <div class="h-8 w-8 rounded-full flex items-center justify-center  bg-gray-100">
                        <iconify-icon
                          class="text-2xl"
                          icon="${iconname}"
                        ></iconify-icon>
                      </div>
                      <div><p>${item}</p></div>
                    </div>
                  </td>
                  <td>${time12}</td>
                  `;

          tbd.appendChild(tr);
        }
      }
    };

    const convertTo12Hour = (time) => {
      const [hours, minutes] = time.split(":");

      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);

      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const createPrayerTime = (prayer) => {
      const [hour, minute] = time[prayer].split(":");

      const prayerTime = new Date();

      prayerTime.setHours(hour);
      prayerTime.setMinutes(minute);
      prayerTime.setSeconds(0);

      return prayerTime;
    };

    const rftime = function () {
      setInterval(() => {
        const crtime = new Date().toLocaleTimeString();
        curtime.textContent = crtime;
      }, 1000);
    };
    rftime();
  }

  const AHURL = "/AsmaulHusna.json";
  const ASmainDiv = document.querySelector("#ASmainDiv");

  const getData = async () => {
    const respo = await fetch(AHURL);
    const Dresp = await respo.json();

    const dfile = Dresp.asmaul_husna;

    if (ASmainDiv) {
      for (item of dfile) {
        const div = document.createElement("div");
        div.innerHTML = `<div
            class="shadow-md h-44 p-4 rounded-md grid grid-cols-1 transition-transform ease-in-out hover:scale-105 duration-700 cursor-pointer hover:bg-[#1f7a4c3f]"
          >
            <h1 class="text-3xl font-noto">${item["arabic"]}</h1>
            <h1 class="sm:text-xl">${item["transliteration"]}</h1>
            <h1 class="sm:text-lg">${item["meaning"]}</h1>
          </div>`;

        if (div) {
          ASmainDiv.append(div);
        }
      }
    }
  };

  getData();

  //Tsbih Screen

  const numUp = document.querySelector("#numUP");
  const numDown = document.querySelector("#numDown");
  const countNum = document.querySelector("#countnum");

  let NumTasbih = 0;

  if (numUp && numDown && countNum) {
    countNum.textContent = NumTasbih;

    numUp.addEventListener("click", () => {
      NumTasbih += 1;
      countNum.textContent = NumTasbih;
    });

    numDown.addEventListener("click", () => {
      if (NumTasbih >= 1) {
        NumTasbih -= 1;
        countNum.textContent = NumTasbih;
      }
    });
  }

  //Quiz Screen

  const qtext = document.querySelector("#qText");
  const quiztext = document.querySelector(".quiztext");
  const options = document.querySelector("#options");
  const resetButton = document.querySelector(".resetButton");
  const crq = document.querySelector("#crq");
  const progressBar = document.querySelector("#progressBar");

  const QuizURL = "/clean_islamic_quiz_dataset.json" + Date.now();

  let quizData = [];
  let currentIndex = 0;
  let Score = 0;
  let qnumb = 1;
  let prsize = 5;

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  resetButton.addEventListener("click", () => {
    loadQuiz();
    currentIndex = 0;
    Score = 0;
    qnumb = 1;
    prsize = 5;
    resetButton.classList.add("hidden");
  });

  const loadQuiz = async () => {
    const req = await fetch(QuizURL);
    quizData = await req.json();

    // optional: shuffle questions
    shuffleArray(quizData);

    showQuestion();
  };

  function showQuestion() {
    options.innerHTML = "";

    progressBar.style = `width: ${prsize}%`;

    const q = quizData[currentIndex];

    qtext.textContent = q.question;
    crq.textContent = qnumb;

    q.options.forEach((item) => {
      const div = document.createElement("div");
      div.className =
        "answ w-full shadow-md flex items-center pl-5 gap-5 rounded-md py-3 border-gray-300 border";

      div.innerHTML = `
      <iconify-icon class="text-orange-200 text-xl" icon="material-symbols-light:mosque-outline"></iconify-icon>
      <p class="text-xl antext text-gray-500">${item}</p>
    `;

      options.appendChild(div);

      div.addEventListener("click", () => {
        const selected = item;
        const correct = q.answer;

        if (selected === correct) {
          Score++;
        }

        // highlight all
        document.querySelectorAll(".answ").forEach((el) => {
          el.classList.remove("bg-[#1F7A4D]");
        });

        // mark selected
        div.classList.add("bg-[#1F7A4D]");

        setTimeout(() => {
          currentIndex++;
          qnumb++;
          prsize += 5;

          if (currentIndex >= 20) {
            qtext.textContent = "";
            resetButton.classList.remove("hidden");
            quiztext.classList.remove("h-36");
            const div = document.createElement("div");
            div.className = `flex justify-center grid grid-col-1 text-center gap-2 `;
            div.innerHTML = `<iconify-icon  class="text-[#1F7A4D] animate-bounce text-8xl" icon="mdi:tick-decagram"></iconify-icon> 
            <p class="py-2 text-4xl">Result</p>
            <p class="py-5 text-4xl">${Score}</p>
            `;
            qtext.append(div);

            options.innerHTML = "";

            return;
          }

          showQuestion();
        }, 500);
      });
    });
  }

  loadQuiz();

  // const getData = async () => {
  //   const url = `https://corsproxy.io/?https://nominatim.openstreetmap.org/search?format=json&q=${city}`;

  //   const response = await fetch(url);

  //   const data = await response.json();

  //   lon = data[0].lon;
  //   lat = data[0].lat;

  //   Adhan();
  // };
  // getData();
});
