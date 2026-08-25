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


/*
    Used only by the Spymaster while preparing a clue.
    These are NOT revealed to Operatives.
*/

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
   FIREBASE AUTH
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

            screen.classList.add(
                "hidden"
            );

        });


    const screen =
        $(id);

    if (screen) {

        screen.classList.remove(
            "hidden"
        );

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

    const t =
        text[currentLanguage];


    if ($("roomTitle"))
        $("roomTitle").textContent =
            t.roomTitle;

    if ($("roomSubtitle"))
        $("roomSubtitle").textContent =
            t.roomSubtitle;


    if ($("createTitle"))
        $("createTitle").textContent =
            t.createTitle;

    if ($("createText"))
        $("createText").textContent =
            t.createText;

    if ($("createRoomButton"))
        $("createRoomButton").textContent =
            t.createButton;


    if ($("joinTitle"))
        $("joinTitle").textContent =
            t.joinTitle;

    if ($("joinText"))
        $("joinText").textContent =
            t.joinText;

    if ($("joinRoomButton"))
        $("joinRoomButton").textContent =
            t.joinButton;


    if ($("nameTitle"))
        $("nameTitle").textContent =
            t.nameTitle;

    if ($("nameSubtitle"))
        $("nameSubtitle").textContent =
            t.nameSubtitle;

    if ($("continueNameButton"))
        $("continueNameButton").textContent =
            t.continue;


    if ($("backToLanguageButton"))
        $("backToLanguageButton").textContent =
            t.back;

    if ($("backToRoomButton"))
        $("backToRoomButton").textContent =
            t.back;


    if ($("lobbySubtitle"))
        $("lobbySubtitle").textContent =
            t.lobbySubtitle;


    if ($("roomCodeLabel"))
        $("roomCodeLabel").textContent =
            t.roomCode;


    if ($("copyRoomButton"))
        $("copyRoomButton").textContent =
            t.copy;


    if ($("teamChoiceTitle"))
        $("teamChoiceTitle").textContent =
            t.team;

    if ($("roleChoiceTitle"))
        $("roleChoiceTitle").textContent =
            t.role;


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
        $("hostText").textContent =
            t.host;

    if ($("waitingText"))
        $("waitingText").textContent =
            t.waiting;

    if ($("startGameButton"))
        $("startGameButton").textContent =
            t.start;

}


/* =========================================================
   LANGUAGE BUTTONS
========================================================= */

if ($("arabicButton")) {

    $("arabicButton")
        .addEventListener(
            "click",
            () => {

                currentLanguage = "ar";

                applyLanguage();

                showScreen(
                    "roomScreen"
                );

            }
        );

}


if ($("englishButton")) {

    $("englishButton")
        .addEventListener(
            "click",
            () => {

                currentLanguage = "en";

                applyLanguage();

                showScreen(
                    "roomScreen"
                );

            }
        );

}


/* =========================================================
   BACK
========================================================= */

if ($("backToLanguageButton")) {

    $("backToLanguageButton")
        .addEventListener(
            "click",
            () => {

                showScreen(
                    "startScreen"
                );

            }
        );

}


if ($("backToRoomButton")) {

    $("backToRoomButton")
        .addEventListener(
            "click",
            () => {

                showScreen(
                    "roomScreen"
                );

            }
        );

}


/* =========================================================
   CREATE ROOM
========================================================= */

if ($("createRoomButton")) {

    $("createRoomButton")
        .addEventListener(
            "click",
            () => {

                roomMode =
                    "create";

                $("playerName").value =
                    "";

                showScreen(
                    "nameScreen"
                );

            }
        );

}


/* =========================================================
   JOIN ROOM
========================================================= */

if ($("joinRoomButton")) {

    $("joinRoomButton")
        .addEventListener(
            "click",
            () => {

                const code =
                    $("joinRoomCode")
                        .value
                        .trim()
                        .toUpperCase();


                if (
                    code.length !== 6
                ) {

                    alert(
                        currentLanguage === "ar"
                            ? "أدخل كود مكون من 6 أحرف."
                            : "Enter a 6-character room code."
                    );

                    return;

                }


                roomMode =
                    "join";

                $("playerName").value =
                    "";

                showScreen(
                    "nameScreen"
                );

            }
        );

}


/* =========================================================
   NAME
========================================================= */

if ($("continueNameButton")) {

    $("continueNameButton")
        .addEventListener(
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

                    if (
                        roomMode ===
                        "create"
                    ) {

                        await createRoom(
                            name
                        );

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

}


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

    while (
        snapshot.exists()
    );


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

            team:
                null,

            role:
                null,

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


    if (
        !snapshot.exists()
    ) {

        throw new Error(
            currentLanguage === "ar"
                ? "الغرفة غير موجودة."
                : "Room not found."
        );

    }


    const room =
        snapshot.data();


    if (
        room.status !==
        "lobby"
    ) {

        throw new Error(
            currentLanguage === "ar"
                ? "اللعبة بدأت بالفعل."
                : "The game has already started."
        );

    }


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

            team:
                null,

            role:
                null,

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

    currentRoomId =
        code;


    if ($("roomCode"))
        $("roomCode").textContent =
            code;


    if ($("gameRoomCode"))
        $("gameRoomCode").textContent =
            code;


    showScreen(
        "lobbyScreen"
    );


    listenToRoom();

    listenToPlayers();

}


/* =========================================================
   ROOM LISTENER
========================================================= */

function listenToRoom() {

    if (
        roomListener
    ) {

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

                if (
                    !snapshot.exists()
                ) {

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


                if (
                    currentRoom.status ===
                    "playing"
                ) {

                    openGame();

                }

                else if (
                    currentRoom.status ===
                    "finished"
                ) {

                    openGame();

                }

                else {

                    showScreen(
                        "lobbyScreen"
                    );

                    updateLobby();

                }

            },

            error => {

                console.error(
                    error
                );

            }
        );

}


/* =========================================================
   PLAYERS LISTENER
========================================================= */

function listenToPlayers() {

    if (
        playersListener
    ) {

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


                currentPlayer =
                    players.find(
                        player =>
                            player.id ===
                            currentUser.uid
                    );


                updateLobby();

                if (
                    currentRoom &&
                    currentRoom.status ===
                    "playing"
                ) {

                    renderGameBoard();

                }

            },

            error => {

                console.error(
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


    $("chooseBlueButton")
        .classList.toggle(
            "selected",
            currentPlayer.team ===
                "blue"
        );


    $("chooseRedButton")
        .classList.toggle(
            "selected",
            currentPlayer.team ===
                "red"
        );


    $("chooseSpyButton")
        .classList.toggle(
            "selected",
            currentPlayer.role ===
                "spymaster"
        );


    $("chooseOperativeButton")
        .classList.toggle(
            "selected",
            currentPlayer.role ===
                "operative"
        );


    const isHost =
        currentRoom.hostId ===
        currentUser.uid;


    $("hostControls")
        .classList.toggle(
            "hidden",
            !isHost
        );


    $("waitingText")
        .classList.toggle(
            "hidden",
            isHost
        );


    /*
        IMPORTANT:

        We no longer require a Spymaster
        on both teams to start the game.

        This allows testing the game
        as Spymaster OR Operative.
    */

    if (isHost) {

        $("startGameButton")
            .disabled =
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
                player.team ===
                    team &&
                player.role ===
                    role
        );


    container.innerHTML = "";


    if (
        filtered.length ===
        0
    ) {

        const empty =
            document.createElement(
                "span"
            );


        empty.className =
            "empty-player";


        empty.textContent =
            currentLanguage ===
                "ar"
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
   TEAM
========================================================= */

if ($("chooseBlueButton")) {

    $("chooseBlueButton")
        .addEventListener(
            "click",
            () =>
                chooseTeam("blue")
        );

}


if ($("chooseRedButton")) {

    $("chooseRedButton")
        .addEventListener(
            "click",
            () =>
                chooseTeam("red")
        );

}


async function chooseTeam(team) {

    if (
        !currentPlayer
    ) {

        return;

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

            team

        }
    );

}


/* =========================================================
   ROLE
========================================================= */

if ($("chooseSpyButton")) {

    $("chooseSpyButton")
        .addEventListener(
            "click",
            () =>
                chooseRole(
                    "spymaster"
                )
        );

}


if ($("chooseOperativeButton")) {

    $("chooseOperativeButton")
        .addEventListener(
            "click",
            () =>
                chooseRole(
                    "operative"
                )
        );

}


async function chooseRole(role) {

    if (
        !currentPlayer.team
    ) {

        alert(
            currentLanguage ===
                "ar"
                ? "اختر الفريق أولًا."
                : "Choose a team first."
        );

        return;

    }


    /*
        Only ONE Spymaster per team.
    */

    if (
        role ===
        "spymaster"
    ) {

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
                currentLanguage ===
                    "ar"
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

if ($("startGameButton")) {

    $("startGameButton")
        .addEventListener(
            "click",
            startGame
        );

}


async function startGame() {

    if (
        !currentRoom ||
        currentRoom.hostId !==
        currentUser.uid
    ) {

        return;

    }


    /*
        The host only needs:
        - a team
        - a role

        We DO NOT require two Spymasters.
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
    ---------------------------------------------------------
    CREATE WORDS
    ---------------------------------------------------------
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
    ---------------------------------------------------------
    FIRST TEAM
    ---------------------------------------------------------
    */

    const startingTeam =
        Math.random() < 0.5
            ? "blue"
            : "red";


    /*
    ---------------------------------------------------------
    CARD TYPES
    ---------------------------------------------------------

    If Blue starts:
        Blue = 9
        Red = 8

    If Red starts:
        Red = 9
        Blue = 8

    Neutral = 7
    Assassin = 1
    */

    const types = [];


    const blueCount =
        startingTeam === "blue"
            ? 9
            : 8;


    const redCount =
        startingTeam === "red"
            ? 9
            : 8;


    for (
        let i = 0;
        i < blueCount;
        i++
    ) {

        types.push(
            "blue"
        );

    }


    for (
        let i = 0;
        i < redCount;
        i++
    ) {

        types.push(
            "red"
        );

    }


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        types.push(
            "neutral"
        );

    }


    types.push(
        "assassin"
    );


    const shuffledTypes =
        shuffle(types);


    const cards =
        selectedWords.map(
            (word, index) => ({

                id:
                    index,

                word,

                type:
                    shuffledTypes[index],

                revealed:
                    false

            })
        );


    /*
    ---------------------------------------------------------
    SAVE GAME
    ---------------------------------------------------------
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

            words:
                selectedWords,

            round:
                1,

            scores: {

                blue:
                    0,

                red:
                    0

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
   GAME
========================================================= */

function openGame() {

    showScreen(
        "gameScreen"
    );


    selectedClueCards.clear();


    renderGameBoard();

}


/* =========================================================
   GAME BOARD
========================================================= */

function renderGameBoard() {

    const gameScreen =
        $("gameScreen");


    if (!gameScreen) {

        console.error(
            "gameScreen not found"
        );

        return;

    }


    if (
        !currentRoom ||
        !currentRoom.cards
    ) {

        return;

    }


    gameScreen.innerHTML =
        "";


    /*
    ---------------------------------------------------------
    HEADER
    ---------------------------------------------------------
    */

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "game-header";


    const title =
        document.createElement(
            "h1"
        );

    title.textContent =
        "DEVClue";


    const room =
        document.createElement(
            "div"
        );

    room.className =
        "game-room";

    room.innerHTML =
        `
        Room
        <strong>
            ${currentRoomId}
        </strong>
        `;


    const round =
        document.createElement(
            "div"
        );

    round.className =
        "game-round";

    round.textContent =
        currentLanguage === "ar"
            ? `الجولة ${currentRoom.round || 1}`
            : `Round ${currentRoom.round || 1}`;


    header.appendChild(
        title
    );

    header.appendChild(
        room
    );

    header.appendChild(
        round
    );


    gameScreen.appendChild(
        header
    );


    /*
    ---------------------------------------------------------
    TURN
    ---------------------------------------------------------
    */

    const turn =
        document.createElement(
            "div"
        );

    turn.className =
        "game-turn";


    const currentTeam =
        currentRoom.currentTeam;


    const teamName =
        currentTeam === "blue"
            ? (
                currentLanguage === "ar"
                    ? "الأزرق"
                    : "Blue"
            )
            : (
                currentLanguage === "ar"
                    ? "الأحمر"
                    : "Red"
            );


    if (
        currentRoom.status ===
        "finished"
    ) {

        turn.textContent =
            currentLanguage === "ar"
                ? "انتهت اللعبة 🏆"
                : "Game Over 🏆";

    }

    else if (
        currentRoom.phase ===
        "clue"
    ) {

        turn.textContent =
            currentLanguage === "ar"
                ? `دور الفريق ${teamName} — التلميح`
                : `${teamName} Team — Give a clue`;

    }

    else {

        turn.textContent =
            currentLanguage === "ar"
                ? `دور الفريق ${teamName} — التخمين`
                : `${teamName} Team — Guess`;

    }


    gameScreen.appendChild(
        turn
    );


    /*
    ---------------------------------------------------------
    CLUE DISPLAY
    ---------------------------------------------------------
    */

    if (
        currentRoom.clue
    ) {

        const clueBox =
            document.createElement(
                "div"
            );

        clueBox.className =
            "current-clue";


        clueBox.innerHTML =
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

            <b>
                ${currentRoom.clueNumber}
            </b>
            `;


        gameScreen.appendChild(
            clueBox
        );

    }


    /*
    ---------------------------------------------------------
    BOARD
    ---------------------------------------------------------
    */

    const board =
        document.createElement(
            "div"
        );

    board.className =
        "game-board";


    currentRoom.cards.forEach(
        cardData => {

            const card =
                document.createElement(
                    "button"
                );


            card.className =
                "word-card";


            card.dataset.id =
                cardData.id;


            card.textContent =
                cardData.word;


            /*
            -------------------------------------------------
            REVEALED
            -------------------------------------------------
            */

            if (
                cardData.revealed
            ) {

                card.classList.add(
                    "revealed"
                );

                card.classList.add(
                    `revealed-${cardData.type}`
                );

            }


            /*
            -------------------------------------------------
            SPYMASTER COLORS
            -------------------------------------------------
            */

            const isSpymaster =
                currentPlayer &&
                currentPlayer.role ===
                    "spymaster";


            if (
                isSpymaster &&
                !cardData.revealed
            ) {

                card.classList.add(
                    `spy-${cardData.type}`
                );

            }


            /*
            -------------------------------------------------
            CLUE TARGET SELECTION
            -------------------------------------------------
            */

            if (
                selectedClueCards.has(
                    String(cardData.id)
                )
            ) {

                card.classList.add(
                    "clue-target"
                );

            }


            /*
            -------------------------------------------------
            CLICK
            -------------------------------------------------
            */

            card.addEventListener(
                "click",
                () => {

                    handleCardClick(
                        cardData
                    );

                }
            );


            board.appendChild(
                card
            );

        }
    );


    gameScreen.appendChild(
        board
    );


    /*
    ---------------------------------------------------------
    CONTROLS
    ---------------------------------------------------------
    */

    renderGameControls(
        gameScreen
    );


    /*
    ---------------------------------------------------------
    SCORE
    ---------------------------------------------------------
    */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "game-info";


    const blueRemaining =
        countRemaining(
            "blue"
        );


    const redRemaining =
        countRemaining(
            "red"
        );


    info.innerHTML =
        `
        <div class="score blue-score">
            🔵
            ${
                currentLanguage === "ar"
                    ? "أزرق"
                    : "Blue"
            }

            <strong>
                ${blueRemaining}
            </strong>
        </div>

        <div class="score red-score">
            🔴
            ${
                currentLanguage === "ar"
                    ? "أحمر"
                    : "Red"
            }

            <strong>
                ${redRemaining}
            </strong>
        </div>
        `;


    gameScreen.appendChild(
        info
    );

}


/* =========================================================
   GAME CONTROLS
========================================================= */

function renderGameControls(
    gameScreen
) {

    if (
        !currentPlayer
    ) {

        return;

    }


    const controls =
        document.createElement(
            "div"
        );

    controls.className =
        "game-controls";


    /*
    ---------------------------------------------------------
    SPYMASTER CLUE
    ---------------------------------------------------------
    */

    const isMyTeam =
        currentPlayer.team ===
        currentRoom.currentTeam;


    const isSpymaster =
        currentPlayer.role ===
        "spymaster";


    if (
        isSpymaster &&
        isMyTeam &&
        currentRoom.phase ===
        "clue"
    ) {

        const selectedCount =
            selectedClueCards.size;


        controls.innerHTML =
            `
            <div class="clue-selection-info">
                ${
                    currentLanguage === "ar"
                        ? `الكلمات المحددة: ${selectedCount}`
                        : `Selected words: ${selectedCount}`
                }
            </div>

            <div class="clue-form">

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
                    id="clueNumberInput"
                    type="number"
                    min="1"
                    max="9"
                    value="${
                        selectedCount > 0
                            ? selectedCount
                            : 1
                    }"
                >

                <button
                    id="giveClueButton"
                    class="primary-game-button"
                >
                    ${
                        currentLanguage === "ar"
                            ? "💡 إعطاء التلميح"
                            : "💡 Give Clue"
                    }
                </button>

            </div>
            `;


        gameScreen.appendChild(
            controls
        );


        $("giveClueButton")
            .addEventListener(
                "click",
                giveClue
            );


        return;

    }


    /*
    ---------------------------------------------------------
    OPERATIVE WAITING
    ---------------------------------------------------------
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
            "guess-info";


        if (
            currentPlayer.team ===
            currentRoom.currentTeam &&
            currentPlayer.role ===
            "operative"
        ) {

            message.textContent =
                currentLanguage === "ar"
                    ? `اختار كلمة — متبقي ${currentRoom.remainingGuesses} تخمين`
                    : `Choose a word — ${currentRoom.remainingGuesses} guesses left`;

        }

        else {

            message.textContent =
                currentLanguage === "ar"
                    ? "بانتظار تخمين الفريق..."
                    : "Waiting for the team to guess...";

        }


        controls.appendChild(
            message
        );

        gameScreen.appendChild(
            controls
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
        !currentPlayer
    ) {

        return;

    }


    /*
    ---------------------------------------------------------
    SPYMASTER:
    SELECT TARGETS FOR CLUE
    ---------------------------------------------------------
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
            selectedClueCards.has(
                id
            )
        ) {

            selectedClueCards.delete(
                id
            );

        }

        else {

            selectedClueCards.add(
                id
            );

        }


        renderGameBoard();

        return;

    }


    /*
    ---------------------------------------------------------
    OPERATIVE:
    GUESS
    ---------------------------------------------------------
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
        $("clueNumberInput");


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


    /*
        Standard Codenames:
        number + 1 guesses are allowed.
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

    const cards =
        [...currentRoom.cards];


    const index =
        cards.findIndex(
            card =>
                String(card.id) ===
                String(selectedCard.id)
        );


    if (
        index === -1
    ) {

        return;

    }


    cards[index] = {

        ...cards[index],

        revealed:
            true

    };


    /*
    ---------------------------------------------------------
    ASSASSIN
    ---------------------------------------------------------
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
    ---------------------------------------------------------
    CORRECT TEAM
    ---------------------------------------------------------
    */

    if (
        selectedCard.type ===
        currentRoom.currentTeam
    ) {

        const newScores = {

            ...(currentRoom.scores || {})

        };


        newScores[
            currentRoom.currentTeam
        ] =
            (
                newScores[
                    currentRoom.currentTeam
                ] || 0
            ) + 1;


        const remaining =
            countRemainingFromCards(
                cards,
                currentRoom.currentTeam
            );


        /*
        -----------------------------------------------------
        WIN
        -----------------------------------------------------
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

                    scores:
                        newScores,

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
                currentRoom.remainingGuesses
                || 0
            ) - 1;


        /*
        -----------------------------------------------------
        EXTRA GUESS FINISHED
        -----------------------------------------------------
        */

        if (
            nextGuesses <= 0
        ) {

            await endTurn(
                cards,
                newScores
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

                scores:
                    newScores,

                remainingGuesses:
                    nextGuesses

            }
        );


        return;

    }


    /*
    ---------------------------------------------------------
    WRONG TEAM / NEUTRAL
    ---------------------------------------------------------
    */

    await endTurn(
        cards,
        currentRoom.scores || {
            blue: 0,
            red: 0
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
   COUNT REMAINING
========================================================= */

function countRemaining(
    team
) {

    if (
        !currentRoom ||
        !currentRoom.cards
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
            card.type ===
                team &&
            !card.revealed
    ).length;

}


/* =========================================================
   COPY ROOM
========================================================= */

if ($("copyRoomButton")) {

    $("copyRoomButton")
        .addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        currentRoomId
                    );


                    $("copyRoomButton")
                        .textContent =
                            currentLanguage ===
                                "ar"
                                ? "تم النسخ ✓"
                                : "Copied ✓";


                    setTimeout(
                        () => {

                            $("copyRoomButton")
                                .textContent =
                                    text[
                                        currentLanguage
                                    ].copy;

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

}


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