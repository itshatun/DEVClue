import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyAB22zDSuD_sbyupfzmTG94pGBOArcoPls",
    authDomain: "devclue.firebaseapp.com",
    projectId: "devclue",
    storageBucket: "devclue.firebasestorage.app",
    messagingSenderId: "174994927059",
    appId: "1:174994927059:web:15a547d17dbc5351245326",
    measurementId: "G-STWJH62EZ2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================================================
   STATE
========================================================= */

let currentUser = null;

let currentRoomId = null;

let currentRoom = null;

let currentPlayer = null;

let players = [];

let currentLanguage = "en";

let roomMode = null;

let roomListener = null;

let playersListener = null;

let selectedClueCards = new Set();


/* =========================================================
   WORD DATABASE
========================================================= */

const words = {

    en: [
        "Moon",
        "Pizza",
        "Robot",
        "Ocean",
        "Castle",
        "Guitar",
        "Fire",
        "Rocket",
        "Beach",
        "Ghost",
        "Camera",
        "Dragon",
        "Mountain",
        "Key",
        "Crown",
        "Phone",
        "Airplane",
        "School",
        "Book",
        "Flower",
        "Car",
        "Doctor",
        "Rain",
        "Sun",
        "Bridge",
        "Star",
        "Train",
        "Diamond",
        "Forest",
        "King"
    ],

    ar: [
        "قمر",
        "بيتزا",
        "روبوت",
        "بحر",
        "قلعة",
        "غيتار",
        "نار",
        "صاروخ",
        "شاطئ",
        "شبح",
        "كاميرا",
        "تنين",
        "جبل",
        "مفتاح",
        "تاج",
        "هاتف",
        "طائرة",
        "مدرسة",
        "كتاب",
        "وردة",
        "سيارة",
        "طبيب",
        "مطر",
        "شمس",
        "جسر",
        "نجمة",
        "قطار",
        "ألماس",
        "غابة",
        "ملك"
    ]

};


/* =========================================================
   DOM
========================================================= */

const $ = id =>
    document.getElementById(id);


/* =========================================================
   AUTH
========================================================= */

signInAnonymously(auth)

    .then(() => {

        console.log(
            "🔥 DEVClue connected to Firebase"
        );

    })

    .catch(error => {

        console.error(error);

        alert(
            "Firebase connection failed:\n" +
            error.message
        );

    });


onAuthStateChanged(
    auth,

    user => {

        currentUser = user;

        if (user) {

            console.log(
                "Player ID:",
                user.uid
            );

        }

    }
);


/* =========================================================
   SCREEN
========================================================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add("hidden");

        });


    const screen = $(id);

    if (screen) {

        screen.classList.remove("hidden");

    }

}


/* =========================================================
   LANGUAGE
========================================================= */

const text = {

    en: {

        roomTitle:
            "Play DEVClue",

        roomSubtitle:
            "Create a room or join your team.",

        createTitle:
            "Create a Room",

        createText:
            "Start a new game and invite your team.",

        createButton:
            "Create Room",

        joinTitle:
            "Join a Room",

        joinText:
            "Enter the room code shared by your host.",

        joinButton:
            "Join Room",

        nameTitle:
            "Enter your name",

        nameSubtitle:
            "This is how your teammates will see you.",

        continue:
            "Continue",

        back:
            "← Back",

        lobbySubtitle:
            "Choose your team and role.",

        roomCode:
            "ROOM CODE",

        copy:
            "Copy",

        team:
            "Choose your team",

        role:
            "Choose your role",

        blue:
            "Blue",

        red:
            "Red",

        spy:
            "Spymaster",

        operative:
            "Operative",

        host:
            "You are the host.",

        waiting:
            "Waiting for the host...",

        start:
            "START GAME"

    },


    ar: {

        roomTitle:
            "العب DEVClue",

        roomSubtitle:
            "أنشئ غرفة أو انضم لفريقك.",

        createTitle:
            "إنشاء غرفة",

        createText:
            "ابدأ لعبة جديدة وشارك الكود مع فريقك.",

        createButton:
            "إنشاء غرفة",

        joinTitle:
            "الانضمام لغرفة",

        joinText:
            "أدخل كود الغرفة الذي شاركه المضيف.",

        joinButton:
            "انضمام",

        nameTitle:
            "اكتب اسمك",

        nameSubtitle:
            "هذا الاسم سيظهر لباقي اللاعبين.",

        continue:
            "متابعة",

        back:
            "← رجوع",

        lobbySubtitle:
            "اختر فريقك ودورك.",

        roomCode:
            "كود الغرفة",

        copy:
            "نسخ",

        team:
            "اختر فريقك",

        role:
            "اختر دورك",

        blue:
            "أزرق",

        red:
            "أحمر",

        spy:
            "سبايماستر",

        operative:
            "اللاعب",

        host:
            "أنت المضيف.",

        waiting:
            "بانتظار المضيف...",

        start:
            "ابدأ اللعبة"

    }

};


/* =========================================================
   APPLY LANGUAGE
========================================================= */

function applyLanguage() {

    const t = text[currentLanguage];


    if ($("roomTitle"))
        $("roomTitle").textContent = t.roomTitle;

    if ($("roomSubtitle"))
        $("roomSubtitle").textContent = t.roomSubtitle;

    if ($("createTitle"))
        $("createTitle").textContent = t.createTitle;

    if ($("createText"))
        $("createText").textContent = t.createText;

    if ($("createRoomButton"))
        $("createRoomButton").textContent = t.createButton;

    if ($("joinTitle"))
        $("joinTitle").textContent = t.joinTitle;

    if ($("joinText"))
        $("joinText").textContent = t.joinText;

    if ($("joinRoomButton"))
        $("joinRoomButton").textContent = t.joinButton;

    if ($("nameTitle"))
        $("nameTitle").textContent = t.nameTitle;

    if ($("nameSubtitle"))
        $("nameSubtitle").textContent = t.nameSubtitle;

    if ($("continueNameButton"))
        $("continueNameButton").textContent = t.continue;

    if ($("backToLanguageButton"))
        $("backToLanguageButton").textContent = t.back;

    if ($("backToRoomButton"))
        $("backToRoomButton").textContent = t.back;

    if ($("lobbySubtitle"))
        $("lobbySubtitle").textContent = t.lobbySubtitle;

    if ($("roomCodeLabel"))
        $("roomCodeLabel").textContent = t.roomCode;

    if ($("copyRoomButton"))
        $("copyRoomButton").textContent = t.copy;

    if ($("teamChoiceTitle"))
        $("teamChoiceTitle").textContent = t.team;

    if ($("roleChoiceTitle"))
        $("roleChoiceTitle").textContent = t.role;

    if ($("chooseBlueButton"))
        $("chooseBlueButton").textContent =
            `🔵 ${t.blue}`;

    if ($("chooseRedButton"))
        $("chooseRedButton").textContent =
            `🔴 ${t.red}`;

    if ($("chooseSpyButton"))
        $("chooseSpyButton").textContent =
            `🕵🏻 ${t.spy}`;

    if ($("chooseOperativeButton"))
        $("chooseOperativeButton").textContent =
            `👥 ${t.operative}`;

    if ($("hostText"))
        $("hostText").textContent = t.host;

    if ($("waitingText"))
        $("waitingText").textContent = t.waiting;

    if ($("startGameButton"))
        $("startGameButton").textContent = t.start;

}


/* =========================================================
   LANGUAGE BUTTONS
========================================================= */

$("arabicButton")?.addEventListener(
    "click",
    () => {

        currentLanguage = "ar";

        applyLanguage();

        showScreen("roomScreen");

    }
);


$("englishButton")?.addEventListener(
    "click",
    () => {

        currentLanguage = "en";

        applyLanguage();

        showScreen("roomScreen");

    }
);


/* =========================================================
   BACK BUTTONS
========================================================= */

$("backToLanguageButton")?.addEventListener(
    "click",
    () => {

        showScreen("startScreen");

    }
);


$("backToRoomButton")?.addEventListener(
    "click",
    () => {

        showScreen("roomScreen");

    }
);


/* =========================================================
   CREATE ROOM
========================================================= */

$("createRoomButton")?.addEventListener(
    "click",
    () => {

        roomMode = "create";

        $("playerName").value = "";

        showScreen("nameScreen");

    }
);


/* =========================================================
   JOIN ROOM
========================================================= */

$("joinRoomButton")?.addEventListener(
    "click",
    () => {

        const code =
            $("joinRoomCode")
                .value
                .trim()
                .toUpperCase();


        if (code.length !== 6) {

            alert(
                currentLanguage === "ar"
                    ? "أدخل كود مكون من 6 أحرف."
                    : "Enter a 6-character room code."
            );

            return;

        }


        roomMode = "join";

        $("playerName").value = "";

        showScreen("nameScreen");

    }
);


/* =========================================================
   NAME
========================================================= */

$("continueNameButton")?.addEventListener(
    "click",
    async () => {

        const name =
            $("playerName")
                .value
                .trim();


        if (!name) {

            alert(
                currentLanguage === "ar"
                    ? "اكتب اسمك أولًا."
                    : "Enter your name first."
            );

            return;

        }


        if (!currentUser) {

            alert(
                currentLanguage === "ar"
                    ? "جاري الاتصال، حاول مرة أخرى."
                    : "Connecting to Firebase..."
            );

            return;

        }


        try {

            if (roomMode === "create") {

                await createRoom(name);

            }

            else {

                const code =
                    $("joinRoomCode")
                        .value
                        .trim()
                        .toUpperCase();


                await joinRoom(
                    code,
                    name
                );

            }

        }

        catch (error) {

            console.error(error);

            alert(
                error.message
            );

        }

    }
);


/* =========================================================
   ROOM CODE
========================================================= */

function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        code +=
            characters[
                Math.floor(
                    Math.random() *
                    characters.length
                )
            ];

    }


    return code;

}


/* =========================================================
   CREATE ROOM
========================================================= */

async function createRoom(name) {

    let code;

    let roomRef;

    let snapshot;


    do {

        code =
            generateRoomCode();

        roomRef =
            doc(
                db,
                "rooms",
                code
            );

        snapshot =
            await getDoc(
                roomRef
            );

    }

    while (snapshot.exists());


    await setDoc(
        roomRef,
        {

            hostId:
                currentUser.uid,

            language:
                currentLanguage,

            status:
                "lobby",

            createdAt:
                serverTimestamp()

        }
    );


    await setDoc(
        doc(
            db,
            "rooms",
            code,
            "players",
            currentUser.uid
        ),
        {

            name,

            team: null,

            role: null,

            joinedAt:
                serverTimestamp()

        }
    );


    openRoom(code);

}


/* =========================================================
   JOIN ROOM
========================================================= */

async function joinRoom(
    code,
    name
) {

    const roomRef =
        doc(
            db,
            "rooms",
            code
        );


    const snapshot =
        await getDoc(
            roomRef
        );


    if (!snapshot.exists()) {

        throw new Error(
            currentLanguage === "ar"
                ? "الغرفة غير موجودة."
                : "Room not found."
        );

    }


    const room =
        snapshot.data();


    if (room.status !== "lobby") {

        throw new Error(
            currentLanguage === "ar"
                ? "اللعبة بدأت بالفعل."
                : "The game has already started."
        );

    }


    /*
       مهم جدًا:
       نستخدم UID الخاص بالضيف كمفتاح للاعب.
       لذلك كل لاعب يحصل على document مستقل.
    */

    await setDoc(
        doc(
            db,
            "rooms",
            code,
            "players",
            currentUser.uid
        ),
        {

            name,

            team: null,

            role: null,

            joinedAt:
                serverTimestamp()

        }
    );


    openRoom(code);

}


/* =========================================================
   OPEN ROOM
========================================================= */

function openRoom(code) {

    currentRoomId = code;


    if ($("roomCode"))
        $("roomCode").textContent = code;

    if ($("gameRoomCode"))
        $("gameRoomCode").textContent = code;


    showScreen("lobbyScreen");


    listenToRoom();

    listenToPlayers();

}


/* =========================================================
   ROOM LISTENER
========================================================= */

function listenToRoom() {

    if (roomListener) {

        roomListener();

    }


    roomListener =
        onSnapshot(
            doc(
                db,
                "rooms",
                currentRoomId
            ),

            snapshot => {

                if (!snapshot.exists()) {

                    alert(
                        currentLanguage === "ar"
                            ? "الغرفة لم تعد موجودة."
                            : "The room no longer exists."
                    );

                    location.reload();

                    return;

                }


                currentRoom =
                    snapshot.data();


                /*
                   اللعبة بدأت
                */

                if (
                    currentRoom.status ===
                    "playing"
                ) {

                    showScreen(
                        "gameScreen"
                    );

                    renderGameBoard();

                    return;

                }


                /*
                   اللعبة انتهت
                */

                if (
                    currentRoom.status ===
                    "finished"
                ) {

                    showScreen(
                        "gameScreen"
                    );

                    renderGameBoard();

                    return;

                }


                /*
                   اللوبي
                */

                showScreen(
                    "lobbyScreen"
                );

                updateLobby();

            },

            error => {

                console.error(
                    "Room listener error:",
                    error
                );

            }
        );

}


/* =========================================================
   PLAYERS LISTENER
========================================================= */

function listenToPlayers() {

    if (playersListener) {

        playersListener();

    }


    const playersRef =
        collection(
            db,
            "rooms",
            currentRoomId,
            "players"
        );


    playersListener =
        onSnapshot(
            playersRef,

            snapshot => {

                players =
                    snapshot.docs.map(
                        player => ({

                            id:
                                player.id,

                            ...player.data()

                        })
                    );


                /*
                   تحديث اللاعب الحالي
                */

                currentPlayer =
                    players.find(
                        player =>
                            player.id ===
                            currentUser.uid
                    );


                /*
                   تحديث اللوبي
                */

                updateLobby();


                /*
                   تحديث اللعبة
                */

                if (
                    currentRoom &&
                    (
                        currentRoom.status ===
                        "playing" ||
                        currentRoom.status ===
                        "finished"
                    )
                ) {

                    renderGameBoard();

                }

            },

            error => {

                console.error(
                    "Players listener error:",
                    error
                );

            }
        );

}


/* =========================================================
   UPDATE LOBBY
========================================================= */

function updateLobby() {

    if (
        !currentRoom ||
        !currentPlayer
    ) {

        return;

    }


    renderPlayerList(
        "blue",
        "spymaster",
        $("blueSpymaster")
    );


    renderPlayerList(
        "blue",
        "operative",
        $("blueOperatives")
    );


    renderPlayerList(
        "red",
        "spymaster",
        $("redSpymaster")
    );


    renderPlayerList(
        "red",
        "operative",
        $("redOperatives")
    );


    /*
       Current player team
    */

    $("chooseBlueButton")?.classList.toggle(
        "selected",
        currentPlayer.team === "blue"
    );


    $("chooseRedButton")?.classList.toggle(
        "selected",
        currentPlayer.team === "red"
    );


    /*
       Current player role
    */

    $("chooseSpyButton")?.classList.toggle(
        "selected",
        currentPlayer.role === "spymaster"
    );


    $("chooseOperativeButton")?.classList.toggle(
        "selected",
        currentPlayer.role === "operative"
    );


    /*
       Host controls
    */

    const isHost =
        currentRoom.hostId ===
        currentUser.uid;


    $("hostControls")?.classList.toggle(
        "hidden",
        !isHost
    );


    $("waitingText")?.classList.toggle(
        "hidden",
        isHost
    );


    /*
       HOST CAN START IF HE HAS
       A TEAM + ROLE.

       We intentionally don't require
       another player for testing.
    */

    if (isHost) {

        $("startGameButton").disabled =
            !currentPlayer.team ||
            !currentPlayer.role;

    }

}


/* =========================================================
   RENDER PLAYERS
========================================================= */

function renderPlayerList(
    team,
    role,
    container
) {

    if (!container) {

        return;

    }


    const filtered =
        players.filter(
            player =>
                player.team === team &&
                player.role === role
        );


    container.innerHTML = "";


    if (filtered.length === 0) {

        const empty =
            document.createElement(
                "span"
            );


        empty.className =
            "empty-player";


        empty.textContent =
            currentLanguage === "ar"
                ? "فارغ"
                : "Empty";


        container.appendChild(
            empty
        );


        return;

    }


    filtered.forEach(
        player => {

            const pill =
                document.createElement(
                    "span"
                );


            pill.className =
                "player-pill";


            if (
                player.id ===
                currentUser.uid
            ) {

                pill.classList.add(
                    "you"
                );

            }


            pill.textContent =
                player.name;


            container.appendChild(
                pill
            );

        }
    );

}


/* =========================================================
   TEAM BUTTONS
========================================================= */

$("chooseBlueButton")?.addEventListener(
    "click",
    () => chooseTeam("blue")
);


$("chooseRedButton")?.addEventListener(
    "click",
    () => chooseTeam("red")
);


async function chooseTeam(team) {

    if (
        !currentUser ||
        !currentRoomId ||
        !currentPlayer
    ) {

        return;

    }


    /*
       If changing team while being Spymaster,
       remove the role first.
    */

    const newRole =
        currentPlayer.team !== team
            ? null
            : currentPlayer.role;


    await updateDoc(
        doc(
            db,
            "rooms",
            currentRoomId,
            "players",
            currentUser.uid
        ),
        {

            team,

            role:
                newRole

        }
    );

}


/* =========================================================
   ROLE BUTTONS
========================================================= */

$("chooseSpyButton")?.addEventListener(
    "click",
    () => chooseRole("spymaster")
);


$("chooseOperativeButton")?.addEventListener(
    "click",
    () => chooseRole("operative")
);


async function chooseRole(role) {

    if (!currentPlayer?.team) {

        alert(
            currentLanguage === "ar"
                ? "اختر الفريق أولًا."
                : "Choose a team first."
        );

        return;

    }


    /*
       One Spymaster per team.
    */

    if (role === "spymaster") {

        const taken =
            players.some(
                player =>
                    player.team ===
                        currentPlayer.team &&

                    player.role ===
                        "spymaster" &&

                    player.id !==
                        currentUser.uid
            );


        if (taken) {

            alert(
                currentLanguage === "ar"
                    ? "هذا الفريق لديه سبايماستر بالفعل."
                    : "This team already has a Spymaster."
            );

            return;

        }

    }


    await updateDoc(
        doc(
            db,
            "rooms",
            currentRoomId,
            "players",
            currentUser.uid
        ),
        {

            role

        }
    );

}


/* =========================================================
   START GAME
========================================================= */

$("startGameButton")?.addEventListener(
    "click",
    startGame
);


async function startGame() {

    if (
        !currentRoom ||
        !currentPlayer
    ) {

        return;

    }


    /*
       ONLY HOST CAN START
    */

    if (
        currentRoom.hostId !==
        currentUser.uid
    ) {

        return;

    }


    /*
       For testing:
       host only needs a team + role.
    */

    if (
        !currentPlayer.team ||
        !currentPlayer.role
    ) {

        alert(
            currentLanguage === "ar"
                ? "اختر فريقك ودورك أولًا."
                : "Choose your team and role first."
        );

        return;

    }


    /*
       Generate 25 words
    */

    const selectedWords =
        shuffle(
            words[
                currentRoom.language
            ]
        ).slice(
            0,
            25
        );


    /*
       Pick starting team
    */

    const startingTeam =
        Math.random() < 0.5
            ? "blue"
            : "red";


    /*
       Standard Codenames distribution
    */

    const blueCount =
        startingTeam === "blue"
            ? 9
            : 8;


    const redCount =
        startingTeam === "red"
            ? 9
            : 8;


    const types = [];


    for (
        let i = 0;
        i < blueCount;
        i++
    ) {

        types.push("blue");

    }


    for (
        let i = 0;
        i < redCount;
        i++
    ) {

        types.push("red");

    }


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        types.push("neutral");

    }


    types.push("assassin");


    const shuffledTypes =
        shuffle(types);


    const cards =
        selectedWords.map(
            (word, index) => ({

                id: index,

                word,

                type:
                    shuffledTypes[index],

                revealed: false

            })
        );


    /*
       Save complete game state
    */

    await updateDoc(
        doc(
            db,
            "rooms",
            currentRoomId
        ),
        {

            status:
                "playing",

            cards,

            round:
                1,

            scores: {

                blue: 0,

                red: 0

            },

            currentTeam:
                startingTeam,

            phase:
                "clue",

            clue:
                "",

            clueNumber:
                0,

            remainingGuesses:
                0,

            winner:
                null

        }
    );

}


/* =========================================================
   GAME BOARD
========================================================= */

function renderGameBoard() {

    if (
        !currentRoom ||
        !currentRoom.cards ||
        !currentPlayer
    ) {

        return;

    }


    const gameScreen =
        $("gameScreen");


    if (!gameScreen) {

        return;

    }


    /*
       DO NOT REBUILD THE ENTIRE HTML PAGE.
       We only build the game content
       inside gameScreen.
    */

    gameScreen.innerHTML = "";


    /*
       GAME HEADER
    */

    const header =
        document.createElement(
            "header"
        );


    header.className =
        "game-header";


    const brand =
        document.createElement(
            "div"
        );


    brand.className =
        "game-brand";


    brand.innerHTML =
        `DEV<span>Clue</span>`;


    const roomBox =
        document.createElement(
            "div"
        );


    roomBox.className =
        "game-room";


    roomBox.innerHTML =
        `
        <span>Room</span>
        <strong>${currentRoomId}</strong>
        `;


    const roundBox =
        document.createElement(
            "div"
        );


    roundBox.className =
        "round-info";


    roundBox.innerHTML =
        `
        <span>
            ${
                currentLanguage === "ar"
                    ? `الجولة ${currentRoom.round || 1}`
                    : `Round ${currentRoom.round || 1}`
            }
        </span>

        <span class="turn-label">
            ${
                currentRoom.currentTeam === "blue"
                    ? (
                        currentLanguage === "ar"
                            ? "الفريق الأزرق"
                            : "Team Blue"
                    )
                    : (
                        currentLanguage === "ar"
                            ? "الفريق الأحمر"
                            : "Team Red"
                    )
            }
        </span>
        `;


    header.appendChild(
        brand
    );

    header.appendChild(
        roomBox
    );

    header.appendChild(
        roundBox
    );


    gameScreen.appendChild(
        header
    );


    /*
       GAME TITLE
    */

    const top =
        document.createElement(
            "div"
        );


    top.className =
        "game-topbar";


    const titleBox =
        document.createElement(
            "div"
        );


    const roleLabel =
        document.createElement(
            "span"
        );


    roleLabel.className =
        "role-small";


    roleLabel.textContent =
        currentPlayer.role === "spymaster"
            ? "SPYMASTER"
            : "OPERATIVES";


    const teamTitle =
        document.createElement(
            "h2"
        );


    teamTitle.textContent =
        currentPlayer.team === "blue"
            ? (
                currentLanguage === "ar"
                    ? "الفريق الأزرق"
                    : "Team Blue"
            )
            : (
                currentLanguage === "ar"
                    ? "الفريق الأحمر"
                    : "Team Red"
            );


    titleBox.appendChild(
        roleLabel
    );

    titleBox.appendChild(
        teamTitle
    );


    /*
       SCORE
    */

    const scoreBoard =
        document.createElement(
            "div"
        );


    scoreBoard.className =
        "score-board";


    scoreBoard.innerHTML =
        `
        <div class="score blue-score">

            <span>BLUE</span>

            <strong>
                ${
                    currentRoom.scores?.blue || 0
                }
            </strong>

        </div>

        <div class="score red-score">

            <span>RED</span>

            <strong>
                ${
                    currentRoom.scores?.red || 0
                }
            </strong>

        </div>
        `;


    top.appendChild(
        titleBox
    );

    top.appendChild(
        scoreBoard
    );


    gameScreen.appendChild(
        top
    );


    /*
       TURN / INSTRUCTION
    */

    const instruction =
        document.createElement(
            "div"
        );


    instruction.className =
        "instruction";


    if (
        currentRoom.status ===
        "finished"
    ) {

        instruction.textContent =
            currentLanguage === "ar"
                ? "انتهت اللعبة 🏆"
                : "Game Over 🏆";

    }

    else if (
        currentRoom.phase ===
        "clue"
    ) {

        instruction.textContent =
            currentPlayer.role ===
                "spymaster"
                ? (
                    currentPlayer.team ===
                    currentRoom.currentTeam
                        ? (
                            currentLanguage === "ar"
                                ? "اختر الكلمات التي تريد ربطها بالتلميح 💡"
                                : "Select the words for your clue 💡"
                        )
                        : (
                            currentLanguage === "ar"
                                ? "بانتظار الفريق الآخر..."
                                : "Waiting for the other team..."
                        )
                )
                : (
                    currentLanguage === "ar"
                        ? "بانتظار التلميح..."
                        : "Waiting for the clue..."
                );

    }

    else {

        instruction.textContent =
            currentPlayer.role ===
                "operative" &&
            currentPlayer.team ===
                currentRoom.currentTeam
                ? (
                    currentLanguage === "ar"
                        ? `اختر كلمة — متبقي ${currentRoom.remainingGuesses} تخمين`
                        : `Choose a card — ${currentRoom.remainingGuesses} guesses left`
                )
                : (
                    currentLanguage === "ar"
                        ? "بانتظار تخمين الفريق..."
                        : "Waiting for the team to guess..."
                );

    }


    gameScreen.appendChild(
        instruction
    );


    /*
       CURRENT CLUE
    */

    if (
        currentRoom.clue
    ) {

        const clue =
            document.createElement(
                "div"
            );


        clue.className =
            "current-clue";


        clue.innerHTML =
            `
            <span>
                ${
                    currentLanguage === "ar"
                        ? "التلميح"
                        : "CLUE"
                }
            </span>

            <strong>
                ${currentRoom.clue}
            </strong>

            <strong>
                ${currentRoom.clueNumber}
            </strong>
            `;


        gameScreen.appendChild(
            clue
        );

    }


    /*
       CARDS
    */

    const board =
        document.createElement(
            "section"
        );


    board.className =
        "cards-container";


    currentRoom.cards.forEach(
        cardData => {

            const card =
                document.createElement(
                    "button"
                );


            card.className =
                "card";


            card.textContent =
                cardData.word;


            /*
               Revealed cards
            */

            if (
                cardData.revealed
            ) {

                card.classList.add(
                    `team-${cardData.type}`
                );

                if (
                    cardData.type ===
                    "neutral"
                ) {

                    card.classList.add(
                        "neutral"
                    );

                }

                if (
                    cardData.type ===
                    "assassin"
                ) {

                    card.classList.add(
                        "danger"
                    );

                }

            }


            /*
               Spymaster secret colors
            */

            const isSpymaster =
                currentPlayer.role ===
                "spymaster";


            if (
                isSpymaster &&
                !cardData.revealed
            ) {

                if (
                    cardData.type ===
                    "blue"
                ) {

                    card.classList.add(
                        "team-blue"
                    );

                }

                else if (
                    cardData.type ===
                    "red"
                ) {

                    card.classList.add(
                        "team-red"
                    );

                }

                else if (
                    cardData.type ===
                    "neutral"
                ) {

                    card.classList.add(
                        "neutral"
                    );

                }

                else if (
                    cardData.type ===
                    "assassin"
                ) {

                    card.classList.add(
                        "danger"
                    );

                }

            }


            /*
               Selected clue cards
            */

            if (
                selectedClueCards.has(
                    String(cardData.id)
                )
            ) {

                card.classList.add(
                    "pending"
                );

            }


            /*
               Only Operatives can guess.
               Spymaster can select clue cards.
            */

            const canClick =
                (
                    currentPlayer.role ===
                    "spymaster" &&

                    currentPlayer.team ===
                    currentRoom.currentTeam &&

                    currentRoom.phase ===
                    "clue" &&

                    !cardData.revealed
                )
                ||
                (
                    currentPlayer.role ===
                    "operative" &&

                    currentPlayer.team ===
                    currentRoom.currentTeam &&

                    currentRoom.phase ===
                    "guessing" &&

                    !cardData.revealed
                );


            if (canClick) {

                card.style.cursor =
                    "pointer";

                card.classList.add(
                    "operative-card"
                );


                card.addEventListener(
                    "click",
                    () =>
                        handleCardClick(
                            cardData
                        )
                );

            }

            else {

                card.disabled =
                    false;

            }


            board.appendChild(
                card
            );

        }
    );


    gameScreen.appendChild(
        board
    );


    /*
       GAME CONTROLS
    */

    renderGameControls(
        gameScreen
    );


    /*
       GAME OVER
    */

    if (
        currentRoom.status ===
        "finished"
    ) {

        renderGameOver(
            gameScreen
        );

    }

}


/* =========================================================
   GAME CONTROLS
========================================================= */

function renderGameControls(
    gameScreen
) {

    if (!currentPlayer) {

        return;

    }


    /*
       SPYMASTER
    */

    const isSpymaster =
        currentPlayer.role ===
        "spymaster";


    const isMyTeam =
        currentPlayer.team ===
        currentRoom.currentTeam;


    if (
        isSpymaster &&
        isMyTeam &&
        currentRoom.phase ===
        "clue"
    ) {

        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "clue-panel";


        panel.innerHTML =
            `
            <label>
                ${
                    currentLanguage === "ar"
                        ? "تلميحك"
                        : "Your Clue"
                }
            </label>

            <div class="clue-input-row">

                <input
                    id="clueInput"
                    type="text"
                    maxlength="30"
                    placeholder="${
                        currentLanguage === "ar"
                            ? "اكتب التلميح..."
                            : "Enter your clue..."
                    }"
                >

                <input
                    id="clueNumber"
                    type="number"
                    min="1"
                    max="9"
                    value="${
                        selectedClueCards.size ||
                        1
                    }"
                >

                <button
                    id="giveClueButton"
                    class="primary-button"
                >
                    ${
                        currentLanguage === "ar"
                            ? "إعطاء التلميح"
                            : "Give Clue"
                    }
                </button>

            </div>

            <p
                style="
                    margin-top:10px;
                    color:#5f6368;
                    font-size:13px;
                    text-align:center;
                "
            >
                ${
                    currentLanguage === "ar"
                        ? `الكلمات المحددة: ${selectedClueCards.size}`
                        : `Selected words: ${selectedClueCards.size}`
                }
            </p>
            `;


        gameScreen.appendChild(
            panel
        );


        $("giveClueButton")
            ?.addEventListener(
                "click",
                giveClue
            );


        return;

    }


    /*
       OPERATIVE WAITING
    */

    if (
        currentRoom.phase ===
        "guessing"
    ) {

        const message =
            document.createElement(
                "div"
            );


        message.className =
            "instruction";


        message.textContent =
            currentPlayer.team ===
                currentRoom.currentTeam &&
            currentPlayer.role ===
                "operative"
                ? (
                    currentLanguage === "ar"
                        ? "اختر كلمة من الكلمات 👆"
                        : "Choose a card 👆"
                )
                : (
                    currentLanguage === "ar"
                        ? "بانتظار الفريق..."
                        : "Waiting for the team..."
                );


        gameScreen.appendChild(
            message
        );

    }

}


/* =========================================================
   CARD CLICK
========================================================= */

function handleCardClick(
    cardData
) {

    if (
        !currentPlayer ||
        !currentRoom
    ) {

        return;

    }


    /*
       SPYMASTER:
       Select multiple cards
    */

    if (
        currentPlayer.role ===
        "spymaster" &&

        currentPlayer.team ===
        currentRoom.currentTeam &&

        currentRoom.phase ===
        "clue" &&

        !cardData.revealed
    ) {

        const id =
            String(cardData.id);


        if (
            selectedClueCards.has(id)
        ) {

            selectedClueCards.delete(id);

        }

        else {

            selectedClueCards.add(id);

        }


        renderGameBoard();

        return;

    }


    /*
       OPERATIVE:
       Make a guess
    */

    if (
        currentPlayer.role !==
        "operative"
    ) {

        return;

    }


    if (
        currentPlayer.team !==
        currentRoom.currentTeam
    ) {

        return;

    }


    if (
        currentRoom.phase !==
        "guessing"
    ) {

        return;

    }


    if (
        cardData.revealed
    ) {

        return;

    }


    makeGuess(
        cardData
    );

}


/* =========================================================
   GIVE CLUE
========================================================= */

async function giveClue() {

    const input =
        $("clueInput");


    const numberInput =
        $("clueNumber");


    if (!input || !numberInput) {

        return;

    }


    const clue =
        input.value.trim();


    const number =
        Number(
            numberInput.value
        );


    if (!clue) {

        alert(
            currentLanguage === "ar"
                ? "اكتب التلميح أولًا."
                : "Enter a clue first."
        );

        return;

    }


    if (
        !number ||
        number < 1 ||
        number > 9
    ) {

        alert(
            currentLanguage === "ar"
                ? "اختر رقمًا من 1 إلى 9."
                : "Choose a number from 1 to 9."
        );

        return;

    }


    if (
        currentPlayer.role !==
        "spymaster"
    ) {

        return;

    }


    if (
        currentPlayer.team !==
        currentRoom.currentTeam
    ) {

        return;

    }


    if (
        selectedClueCards.size ===
        0
    ) {

        alert(
            currentLanguage === "ar"
                ? "حدد كلمة واحدة على الأقل."
                : "Select at least one card."
        );

        return;

    }


    /*
       Save clue.
       The selected cards stay local
       to the Spymaster only.
    */

    await updateDoc(
        doc(
            db,
            "rooms",
            currentRoomId
        ),
        {

            clue,

            clueNumber:
                number,

            remainingGuesses:
                number + 1,

            phase:
                "guessing"

        }
    );


    selectedClueCards.clear();

}


/* =========================================================
   MAKE GUESS
========================================================= */

async function makeGuess(
    selectedCard
) {

    if (
        !currentRoom ||
        !currentRoom.cards
    ) {

        return;

    }


    const cards =
        [...currentRoom.cards];


    const index =
        cards.findIndex(
            card =>
                String(card.id) ===
                String(selectedCard.id)
        );


    if (index === -1) {

        return;

    }


    /*
       Prevent duplicate guesses
    */

    if (
        cards[index].revealed
    ) {

        return;

    }


    cards[index] = {

        ...cards[index],

        revealed:
            true

    };


    /*
       ASSASSIN
    */

    if (
        selectedCard.type ===
        "assassin"
    ) {

        const winner =
            currentRoom.currentTeam ===
                "blue"
                ? "red"
                : "blue";


        await updateDoc(
            doc(
                db,
                "rooms",
                currentRoomId
            ),
            {

                cards,

                status:
                    "finished",

                winner

            }
        );


        return;

    }


    /*
       CORRECT TEAM
    */

    if (
        selectedCard.type ===
        currentRoom.currentTeam
    ) {

        const scores = {

            blue:
                currentRoom.scores?.blue || 0,

            red:
                currentRoom.scores?.red || 0

        };


        scores[
            currentRoom.currentTeam
        ]++;


        const remaining =
            countRemainingFromCards(
                cards,
                currentRoom.currentTeam
            );


        /*
           TEAM WINS
        */

        if (
            remaining === 0
        ) {

            await updateDoc(
                doc(
                    db,
                    "rooms",
                    currentRoomId
                ),
                {

                    cards,

                    scores,

                    status:
                        "finished",

                    winner:
                        currentRoom.currentTeam

                }
            );


            return;

        }


        const nextGuesses =
            (
                currentRoom.remainingGuesses ||
                0
            ) - 1;


        /*
           END TURN
        */

        if (
            nextGuesses <= 0
        ) {

            await endTurn(
                cards,
                scores
            );

            return;

        }


        await updateDoc(
            doc(
                db,
                "rooms",
                currentRoomId
            ),
            {

                cards,

                scores,

                remainingGuesses:
                    nextGuesses

            }
        );


        return;

    }


    /*
       WRONG TEAM OR NEUTRAL
    */

    await endTurn(
        cards,
        {
            blue:
                currentRoom.scores?.blue || 0,

            red:
                currentRoom.scores?.red || 0
        }
    );

}


/* =========================================================
   END TURN
========================================================= */

async function endTurn(
    cards,
    scores
) {

    const nextTeam =
        currentRoom.currentTeam ===
            "blue"
            ? "red"
            : "blue";


    await updateDoc(
        doc(
            db,
            "rooms",
            currentRoomId
        ),
        {

            cards,

            scores,

            currentTeam:
                nextTeam,

            phase:
                "clue",

            clue:
                "",

            clueNumber:
                0,

            remainingGuesses:
                0

        }
    );


    selectedClueCards.clear();

}


/* =========================================================
   GAME OVER
========================================================= */

function renderGameOver(
    gameScreen
) {

    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "game-over";


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "game-over-card";


    const winner =
        currentRoom.winner;


    const winnerName =
        winner === "blue"
            ? (
                currentLanguage === "ar"
                    ? "الفريق الأزرق يفوز! 🔵"
                    : "Blue Team Wins! 🔵"
            )
            : (
                currentLanguage === "ar"
                    ? "الفريق الأحمر يفوز! 🔴"
                    : "Red Team Wins! 🔴"
            );


    card.innerHTML =
        `
        <span>
            GAME OVER
        </span>

        <h2>
            ${winnerName}
        </h2>

        <button
            id="newRoundButton"
            class="primary-button large-button"
        >
            ${
                currentLanguage === "ar"
                    ? "جولة جديدة"
                    : "New Round"
            }
        </button>
        `;


    overlay.appendChild(
        card
    );


    gameScreen.appendChild(
        overlay
    );


    $("newRoundButton")
        ?.addEventListener(
            "click",
            startNewRound
        );

}


/* =========================================================
   NEW ROUND
========================================================= */

async function startNewRound() {

    if (
        !currentRoom ||
        currentRoom.hostId !==
        currentUser.uid
    ) {

        return;

    }


    const selectedWords =
        shuffle(
            words[
                currentRoom.language
            ]
        ).slice(
            0,
            25
        );


    const startingTeam =
        Math.random() < 0.5
            ? "blue"
            : "red";


    const blueCount =
        startingTeam === "blue"
            ? 9
            : 8;


    const redCount =
        startingTeam === "red"
            ? 9
            : 8;


    const types = [];


    for (
        let i = 0;
        i < blueCount;
        i++
    ) {

        types.push("blue");

    }


    for (
        let i = 0;
        i < redCount;
        i++
    ) {

        types.push("red");

    }


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        types.push("neutral");

    }


    types.push("assassin");


    const shuffledTypes =
        shuffle(types);


    const cards =
        selectedWords.map(
            (word, index) => ({

                id: index,

                word,

                type:
                    shuffledTypes[index],

                revealed: false

            })
        );


    await updateDoc(
        doc(
            db,
            "rooms",
            currentRoomId
        ),
        {

            status:
                "playing",

            cards,

            round:
                (currentRoom.round || 1) + 1,

            scores: {

                blue: 0,

                red: 0

            },

            currentTeam:
                startingTeam,

            phase:
                "clue",

            clue:
                "",

            clueNumber:
                0,

            remainingGuesses:
                0,

            winner:
                null

        }
    );

}


/* =========================================================
   COUNT REMAINING
========================================================= */

function countRemaining(
    team
) {

    if (
        !currentRoom?.cards
    ) {

        return 0;

    }


    return countRemainingFromCards(
        currentRoom.cards,
        team
    );

}


function countRemainingFromCards(
    cards,
    team
) {

    return cards.filter(
        card =>
            card.type === team &&
            !card.revealed
    ).length;

}


/* =========================================================
   COPY ROOM
========================================================= */

$("copyRoomButton")?.addEventListener(
    "click",
    async () => {

        try {

            await navigator.clipboard.writeText(
                currentRoomId
            );


            $("copyRoomButton")
                .textContent =
                    currentLanguage === "ar"
                        ? "تم النسخ ✓"
                        : "Copied ✓";


            setTimeout(
                () => {

                    if ($("copyRoomButton")) {

                        $("copyRoomButton")
                            .textContent =
                                text[
                                    currentLanguage
                                ].copy;

                    }

                },
                1500
            );

        }

        catch {

            alert(
                currentRoomId
            );

        }

    }
);


/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(array) {

    const result =
        [...array];


    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];

    }


    return result;

}


/* =========================================================
   INIT
========================================================= */

applyLanguage();
