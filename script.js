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
    serverTimestamp,
    runTransaction
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

let authReady = false;
let activeScreen = "";
let lastRenderedRoomState = "";


/*
    Local only.

    Spymaster uses this to visually select
    cards connected to the clue.

    These selections are NOT saved to Firestore.
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

        authReady = !!user;

        console.log(
            "⚡ Auth ready:",
            authReady,
            new Date().toLocaleTimeString()
        );

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

    if (activeScreen === id) {
        return;
    }

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add(
                "hidden"
            );

        });

    const screen = $(id);

    if (screen) {

        screen.classList.remove(
            "hidden"
        );

        activeScreen = id;

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
   BACK BUTTONS
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


                if (
                    !authReady ||
                    !currentUser
                ) {

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

                    console.error(
                        error
                    );

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

async function createRoom(
    name
) {

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

function openRoom(
    code
) {

    currentRoomId =
        code;

    activeScreen = "";

    lastRenderedRoomState =
        "";

    selectedClueCards.clear();


    if ($("roomCode"))
        $("roomCode").textContent =
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

        roomListener =
            null;

    }


    roomListener =
        onSnapshot(
            doc(
                db,
                "rooms",
                currentRoomId
            ),

            {
                includeMetadataChanges:
                    false
            },

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
                        "playing" ||
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

    if (
        playersListener
    ) {

        playersListener();

        playersListener =
            null;

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

            {
                includeMetadataChanges:
                    false
            },

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
                    ) || null;


                if (
                    currentRoom &&
                    (
                        currentRoom.status ===
                        "playing" ||

                        currentRoom.status ===
                        "finished"
                    )
                ) {

                    lastRenderedRoomState =
                        "";

                    renderGameBoard();

                }

                else {

                    updateLobby();

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


    if ($("chooseBlueButton")) {

        $("chooseBlueButton")
            .classList.toggle(
                "selected",
                currentPlayer.team ===
                    "blue"
            );

    }


    if ($("chooseRedButton")) {

        $("chooseRedButton")
            .classList.toggle(
                "selected",
                currentPlayer.team ===
                    "red"
            );

    }


    if ($("chooseSpyButton")) {

        $("chooseSpyButton")
            .classList.toggle(
                "selected",
                currentPlayer.role ===
                    "spymaster"
            );

    }


    if ($("chooseOperativeButton")) {

        $("chooseOperativeButton")
            .classList.toggle(
                "selected",
                currentPlayer.role ===
                    "operative"
            );

    }


    const isHost =
        currentRoom.hostId ===
        currentUser.uid;


    if ($("hostControls")) {

        $("hostControls")
            .classList.toggle(
                "hidden",
                !isHost
            );

    }


    if ($("waitingText")) {

        $("waitingText")
            .classList.toggle(
                "hidden",
                isHost
            );

    }


    if (
        isHost &&
        $("startGameButton")
    ) {

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
                player.team === team &&
                player.role === role
        );


    container.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

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


async function chooseTeam(
    team
) {

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
   ROLE BUTTONS
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


async function chooseRole(
    role
) {

    if (
        !currentPlayer ||
        !currentPlayer.team
    ) {

        alert(
            currentLanguage === "ar"
                ? "اختر الفريق أولًا."
                : "Choose a team first."
        );

        return;

    }


    if (
        role === "spymaster"
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


    if (
        !currentPlayer ||
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


    const language =
        currentRoom.language ||
        currentLanguage;


    const sourceWords =
        words[language] ||
        words.en;


    const selectedWords =
        shuffle(
            sourceWords
        ).slice(
            0,
            25
        );


    const startingTeam =
        Math.random() < 0.5
            ? "blue"
            : "red";


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

                word:
                    String(word),

                type:
                    shuffledTypes[index],

                revealed:
                    false

            })
        );


    selectedClueCards.clear();

    lastRenderedRoomState =
        "";


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

            clueByName:
                "",

            clueById:
                "",

            clueTeam:
                "",

            winner:
                null

        }
    );

}


/* =========================================================
   OPEN GAME
========================================================= */

function openGame() {

    if (
        !currentRoom
    ) {

        return;

    }


    showScreen(
        "gameScreen"
    );


    renderGameBoard();

}


/* =========================================================
   GAME BOARD
========================================================= */

function renderGameBoard() {

    const gameScreen =
        $("gameScreen");


    if (
        !gameScreen ||
        !currentRoom ||
        !Array.isArray(
            currentRoom.cards
        ) ||
        !currentPlayer
    ) {

        return;

    }


    const stateKey =
        JSON.stringify({

            status:
                currentRoom.status,

            phase:
                currentRoom.phase,

            currentTeam:
                currentRoom.currentTeam,

            clue:
                currentRoom.clue,

            clueNumber:
                currentRoom.clueNumber,

            clueByName:
                currentRoom.clueByName,

            clueTeam:
                currentRoom.clueTeam,

            cards:
                currentRoom.cards,

            scores:
                currentRoom.scores,

            winner:
                currentRoom.winner,

            playerRole:
                currentPlayer.role,

            playerTeam:
                currentPlayer.team,

            selectedClueCards:
                [
                    ...selectedClueCards
                ].sort()

        });


    if (
        stateKey ===
        lastRenderedRoomState
    ) {

        return;

    }


    lastRenderedRoomState =
        stateKey;


    gameScreen.innerHTML =
        "";


    renderGameHeader(
        gameScreen
    );

    renderTurnMessage(
        gameScreen
    );

    renderGameLog(
        gameScreen
    );

    renderBoard(
        gameScreen
    );

    renderControls(
        gameScreen
    );

    renderScores(
        gameScreen
    );

    renderGameOver(
        gameScreen
    );

}


/* =========================================================
   GAME HEADER
========================================================= */

function renderGameHeader(
    gameScreen
) {

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
            ${escapeHtml(
                currentRoomId
            )}
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

}


/* =========================================================
   TURN MESSAGE
========================================================= */

function renderTurnMessage(
    gameScreen
) {

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
        currentPlayer.team !==
        currentTeam
    ) {

        turn.textContent =
            currentLanguage === "ar"

                ? `⏳ بانتظار الفريق ${teamName}`

                : `⏳ Waiting for ${teamName} Team`;

    }

    else if (
        currentRoom.phase ===
        "clue"
    ) {

        if (
            currentPlayer.role ===
            "spymaster"
        ) {

            turn.textContent =
                currentLanguage === "ar"

                    ? "دور فريقك — اختر الكروت وأعطِ التلميح"

                    : "Your team's turn — Select cards and give a clue";

        }

        else {

            turn.textContent =
                currentLanguage === "ar"

                    ? "دور فريقك — بانتظار التلميح"

                    : "Your team's turn — Waiting for the clue";

        }

    }

    else {

        if (
            currentPlayer.role ===
            "operative"
        ) {

            turn.textContent =
                currentLanguage === "ar"

                    ? "دور فريقك — اختر الكروت"

                    : "Your team's turn — Choose the cards";

        }

        else {

            turn.textContent =
                currentLanguage === "ar"

                    ? "فريقك يخمّن الآن"

                    : "Your team is guessing";

        }

    }


    gameScreen.appendChild(
        turn
    );

}


/* =========================================================
   GAME LOG
========================================================= */

function renderGameLog(
    gameScreen
) {

    const log =
        document.createElement(
            "div"
        );

    log.className =
        "game-log";


    /*
    ---------------------------------------------------------
    CURRENT TEAM COLOR
    ---------------------------------------------------------
    */

    if (
        currentRoom.clueTeam ===
        "blue"
    ) {

        log.classList.add(
            "blue-log"
        );

    }

    else if (
        currentRoom.clueTeam ===
        "red"
    ) {

        log.classList.add(
            "red-log"
        );

    }


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
        "game-log-header";

    header.textContent =
        currentLanguage === "ar"
            ? "سجل اللعبة"
            : "GAME LOG";


    /*
    ---------------------------------------------------------
    CONTENT
    ---------------------------------------------------------
    */

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "game-log-content";


    /*
    ---------------------------------------------------------
    EMPTY
    ---------------------------------------------------------
    */

    if (
        !currentRoom.clue
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "game-log-empty";

        empty.textContent =
            currentLanguage === "ar"
                ? "بانتظار التلميح..."
                : "Waiting for a clue...";

        content.appendChild(
            empty
        );

    }


    /*
    ---------------------------------------------------------
    CLUE
    ---------------------------------------------------------
    */

    else {

        const clueItem =
            document.createElement(
                "div"
            );

        clueItem.className =
            "clue-log-item";


        /*
        AVATAR
        */

        const avatar =
            document.createElement(
                "div"
            );

        avatar.className =
            "clue-log-avatar";

        avatar.textContent =
            "🕵🏻";


        /*
        SPYMASTER NAME
        */

        const name =
            document.createElement(
                "div"
            );

        name.className =
            "clue-log-name";

        name.textContent =
            currentRoom.clueByName ||
            (
                currentLanguage === "ar"
                    ? "السبايماستر"
                    : "Spymaster"
            );


        /*
        CLUE WORD
        */

        const clue =
            document.createElement(
                "div"
            );

        clue.className =
            "clue-log-word";

        clue.textContent =
            currentRoom.clue;


        /*
        NUMBER
        */

        const number =
            document.createElement(
                "div"
            );

        number.className =
            "clue-log-number";

        number.textContent =
            currentRoom.clueNumber || 0;


        clueItem.appendChild(
            avatar
        );

        clueItem.appendChild(
            name
        );

        clueItem.appendChild(
            clue
        );

        clueItem.appendChild(
            number
        );

        content.appendChild(
            clueItem
        );

    }


    log.appendChild(
        header
    );

    log.appendChild(
        content
    );


    gameScreen.appendChild(
        log
    );

}


/* =========================================================
   BOARD
========================================================= */

function renderBoard(
    gameScreen
) {

    const board =
        document.createElement(
            "div"
        );

    board.className =
        "game-board";


    const language =
        currentRoom.language ||
        currentLanguage;


    const fallbackWords =
        words[language] ||
        words.en;


    const isSpymaster =
        currentPlayer.role ===
        "spymaster";


    currentRoom.cards.forEach(
        cardData => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "word-card";


            card.dataset.id =
                String(
                    cardData.id
                );


            /*
            -------------------------------------------------
            WORD
            -------------------------------------------------
            */

            const cardWord =
                cardData.word !== undefined &&
                cardData.word !== null &&
                String(
                    cardData.word
                ).trim() !== ""

                    ? String(
                        cardData.word
                    )

                    : (
                        fallbackWords[
                            Number(
                                cardData.id
                            )
                        ] || "—"
                    );


            /*
            -------------------------------------------------
            CARD INNER
            -------------------------------------------------
            */

            const inner =
                document.createElement(
                    "div"
                );

            inner.className =
                "card-inner";


            /*
            -------------------------------------------------
            FRONT
            -------------------------------------------------
            */

            const front =
                document.createElement(
                    "div"
                );

            front.className =
                "card-face card-front";


            const wordElement =
                document.createElement(
                    "span"
                );

            wordElement.className =
                "card-word";

            wordElement.textContent =
                cardWord;


            front.appendChild(
                wordElement
            );


            /*
            -------------------------------------------------
            BACK
            -------------------------------------------------
            */

            const back =
                document.createElement(
                    "div"
                );

            back.className =
                "card-face card-back";


            const logo =
                document.createElement(
                    "img"
                );

            logo.className =
                "revealed-logo";

            logo.src =
                "Optional Logo - GDGs Stacked - Light.png";

            logo.alt =
                "GDG";


            back.appendChild(
                logo
            );


            inner.appendChild(
                front
            );

            inner.appendChild(
                back
            );

            card.appendChild(
                inner
            );


            /*
            -------------------------------------------------
            SPYMASTER COLORS
            -------------------------------------------------
            */

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

                card.classList.add(
                    "flipped"
                );

                card.disabled =
                    true;

            }


            /*
            -------------------------------------------------
            CLUE TARGET
            -------------------------------------------------
            */

            if (
                !cardData.revealed &&
                selectedClueCards.has(
                    String(
                        cardData.id
                    )
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

            if (
                !cardData.revealed
            ) {

                card.addEventListener(
                    "click",
                    () => {

                        handleCardClick(
                            cardData
                        );

                    }
                );

            }


            board.appendChild(
                card
            );

        }
    );


    gameScreen.appendChild(
        board
    );

}


/* =========================================================
   CONTROLS
========================================================= */

function renderControls(
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


    const isMyTeam =
        currentPlayer.team ===
        currentRoom.currentTeam;


    /*
    ---------------------------------------------------------
    SPYMASTER
    ---------------------------------------------------------
    */

    if (
        currentPlayer.role ===
            "spymaster" &&

        isMyTeam &&

        currentRoom.phase ===
            "clue" &&

        currentRoom.status ===
            "playing"
    ) {

        renderSpymasterControls(
            controls
        );

        gameScreen.appendChild(
            controls
        );

        return;

    }


    /*
    ---------------------------------------------------------
    OPERATIVE
    ---------------------------------------------------------
    */

    if (
        currentPlayer.role ===
            "operative" &&

        isMyTeam &&

        currentRoom.phase ===
            "guessing" &&

        currentRoom.status ===
            "playing"
    ) {

        renderOperativeControls(
            controls
        );

        gameScreen.appendChild(
            controls
        );

        return;

    }


    /*
    ---------------------------------------------------------
    WAITING
    ---------------------------------------------------------
    */

    if (
        currentRoom.status ===
        "playing"
    ) {

        const message =
            document.createElement(
                "div"
            );


        message.className =
            "guess-info";


        if (
            currentRoom.currentTeam !==
            currentPlayer.team
        ) {

            const teamName =
                currentRoom.currentTeam ===
                    "blue"

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


            message.textContent =
                currentLanguage === "ar"

                    ? `⏳ بانتظار الفريق ${teamName}`

                    : `⏳ Waiting for ${teamName} Team`;

        }

        else if (
            currentRoom.phase ===
            "clue"
        ) {

            message.textContent =
                currentLanguage === "ar"

                    ? "⏳ بانتظار السبايماستر..."

                    : "⏳ Waiting for the Spymaster...";

        }

        else {

            message.textContent =
                currentLanguage === "ar"

                    ? "⏳ بانتظار الفريق..."

                    : "⏳ Waiting for the team...";

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
   SPYMASTER CONTROLS
========================================================= */

function renderSpymasterControls(
    controls
) {

    const selectedCount =
        selectedClueCards.size;


    controls.innerHTML =
        `
        <div class="clue-selection-info">

            ${
                currentLanguage === "ar"

                    ? `الكروت المحددة: ${selectedCount}`

                    : `Selected cards: ${selectedCount}`

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
                max="25"
                value="${selectedCount}"
                readonly
            >

            <button
                id="giveClueButton"
                class="primary-game-button"
                ${
                    selectedCount === 0
                        ? "disabled"
                        : ""
                }
            >
                ${
                    currentLanguage === "ar"
                        ? "💡 إعطاء التلميح"
                        : "💡 Give Clue"
                }
            </button>

        </div>
        `;


    const clueInput =
        $("clueInput");


    if (clueInput) {

        clueInput.focus();

    }


    const giveButton =
        $("giveClueButton");


    if (giveButton) {

        giveButton.addEventListener(
            "click",
            giveClue
        );

    }

}


/* =========================================================
   OPERATIVE CONTROLS
========================================================= */

function renderOperativeControls(
    controls
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "guess-info";


    message.textContent =
        currentLanguage === "ar"

            ? "اختار أي عدد من الكروت، واضغط إنهاء الدور عندما تخلص."

            : "Choose as many cards as you want, then end your turn when you're done.";


    controls.appendChild(
        message
    );


    const endButton =
        document.createElement(
            "button"
        );


    endButton.className =
        "end-turn-button";


    endButton.textContent =
        currentLanguage === "ar"
            ? "إنهاء الدور"
            : "End Turn";


    endButton.addEventListener(
        "click",
        endTurnManually
    );


    controls.appendChild(
        endButton
    );

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
    ---------------------------------------------------------
    SPYMASTER
    ---------------------------------------------------------
    */

    if (
        currentPlayer.role ===
            "spymaster" &&

        currentPlayer.team ===
            currentRoom.currentTeam &&

        currentRoom.phase ===
            "clue" &&

        currentRoom.status ===
            "playing" &&

        !cardData.revealed
    ) {

        const id =
            String(
                cardData.id
            );


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


        lastRenderedRoomState =
            "";


        renderGameBoard();

        return;

    }


    /*
    ---------------------------------------------------------
    OPERATIVE
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
        currentRoom.status !==
        "playing"
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

    const input = $("clueInput");

    if (!input) {
        console.error("❌ clueInput not found");
        return;
    }

    const clue = input.value.trim();
    const selectedCount = selectedClueCards.size;

    /* -----------------------------------------------------
       CHECK CLUE
    ----------------------------------------------------- */

    if (!clue) {

        alert(
            currentLanguage === "ar"
                ? "اكتب التلميح أولًا."
                : "Enter a clue first."
        );

        return;
    }

    /* -----------------------------------------------------
       CHECK CARDS
    ----------------------------------------------------- */

    if (selectedCount === 0) {

        alert(
            currentLanguage === "ar"
                ? "اختر كرتًا واحدًا على الأقل."
                : "Select at least one card."
        );

        return;
    }

    /* -----------------------------------------------------
       CHECK PLAYER
    ----------------------------------------------------- */

    if (!currentUser || !currentPlayer || !currentRoom) {

        alert(
            currentLanguage === "ar"
                ? "لم يتم الاتصال باللعبة بعد."
                : "Game connection is not ready."
        );

        return;
    }

    /* -----------------------------------------------------
       CHECK TURN
    ----------------------------------------------------- */

    if (
        currentPlayer.role !== "spymaster" ||
        currentPlayer.team !== currentRoom.currentTeam ||
        currentRoom.phase !== "clue" ||
        currentRoom.status !== "playing"
    ) {

        console.error("❌ Invalid clue state:", {
            role: currentPlayer.role,
            playerTeam: currentPlayer.team,
            currentTeam: currentRoom.currentTeam,
            phase: currentRoom.phase,
            status: currentRoom.status
        });

        alert(
            currentLanguage === "ar"
                ? "ليس دورك لإعطاء التلميح."
                : "It is not your turn to give a clue."
        );

        return;
    }

    /* -----------------------------------------------------
       SEND TO FIREBASE
    ----------------------------------------------------- */

    const roomRef = doc(
        db,
        "rooms",
        currentRoomId
    );

    try {

        console.log("📤 Sending clue...");
        console.log("Clue:", clue);
        console.log("Number:", selectedCount);
        console.log("Room:", currentRoomId);

        await runTransaction(
            db,
            async transaction => {

                const snapshot =
                    await transaction.get(roomRef);

                if (!snapshot.exists()) {
                    throw new Error("ROOM_NOT_FOUND");
                }

                const room =
                    snapshot.data();

                /* Make sure it is still our turn */

                if (
                    room.status !== "playing" ||
                    room.phase !== "clue" ||
                    room.currentTeam !== currentPlayer.team
                ) {

                    throw new Error(
                        "NOT_YOUR_TURN"
                    );
                }

                /* Send clue */

                transaction.update(
                    roomRef,
                    {

                        clue: clue,

                        clueNumber:
                            selectedCount,

                        clueByName:
                            currentPlayer.name,

                        clueById:
                            currentUser.uid,

                        clueTeam:
                            currentPlayer.team,

                        phase:
                            "guessing"

                    }
                );

            }
        );

        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

        console.log(
            "✅ CLUE SENT SUCCESSFULLY"
        );

        selectedClueCards.clear();

        lastRenderedRoomState = "";

    }

    catch (error) {

        console.error(
            "❌ CLUE ERROR:",
            error
        );

        if (
            error.message ===
            "ROOM_NOT_FOUND"
        ) {

            alert(
                currentLanguage === "ar"
                    ? "الغرفة غير موجودة."
                    : "Room not found."
            );

        }

        else if (
            error.message ===
            "NOT_YOUR_TURN"
        ) {

            alert(
                currentLanguage === "ar"
                    ? "انتهى دورك أو تغير الدور."
                    : "Your turn has ended."
            );

        }

        else {

            alert(
                currentLanguage === "ar"
                    ? "حدث خطأ أثناء إرسال التلميح. افتحي Console لمعرفة الخطأ."
                    : "An error occurred while sending the clue. Check the Console for details."
            );

        }

    }

}


    /* -----------------------------------------------------
       SEND CLUE TO FIREBASE
    ----------------------------------------------------- */

    try {

        console.log(
            "📤 Sending clue:",
            clue,
            "Number:",
            selectedCount
        );


        await updateDoc(
            doc(
                db,
                "rooms",
                currentRoomId
            ),
            {

                clue:
                    clue,

                clueNumber:
                    selectedCount,

                clueByName:
                    currentPlayer.name,

                clueById:
                    currentUser.uid,

                clueTeam:
                    currentPlayer.team,

                phase:
                    "guessing"

            }
        );


        console.log(
            "✅ Clue sent successfully!"
        );


        /* -------------------------------------------------
           CLEAR LOCAL SELECTION
        ------------------------------------------------- */

        selectedClueCards.clear();

        lastRenderedRoomState = "";


    }

    catch (error) {

        console.error(
            "❌ Failed to send clue:",
            error
        );


        alert(
            currentLanguage === "ar"

                ? "ما قدرنا نرسل التلميح. تأكدي من اتصال Firebase وقواعد Firestore."

                : "Could not send the clue. Check Firebase and Firestore rules."
        );

    }

}


/* =========================================================
   MAKE GUESS
========================================================= */

async function makeGuess(
    selectedCard
) {

    if (
        !currentRoom ||
        !currentPlayer ||
        currentRoom.status !==
            "playing" ||
        currentRoom.phase !==
            "guessing" ||
        currentPlayer.role !==
            "operative" ||
        currentPlayer.team !==
            currentRoom.currentTeam
    ) {

        return;

    }


    const roomRef =
        doc(
            db,
            "rooms",
            currentRoomId
        );


    try {

        await runTransaction(
            db,

            async transaction => {

                const snapshot =
                    await transaction.get(
                        roomRef
                    );


                if (
                    !snapshot.exists()
                ) {

                    throw new Error(
                        "ROOM_NOT_FOUND"
                    );

                }


                const room =
                    snapshot.data();


                if (
                    room.status !==
                        "playing" ||

                    room.phase !==
                        "guessing" ||

                    room.currentTeam !==
                        currentPlayer.team
                ) {

                    throw new Error(
                        "NOT_YOUR_TURN"
                    );

                }


                const cards =
                    [...room.cards];


                const index =
                    cards.findIndex(
                        card =>
                            String(
                                card.id
                            ) ===
                            String(
                                selectedCard.id
                            )
                    );


                if (
                    index === -1
                ) {

                    throw new Error(
                        "CARD_NOT_FOUND"
                    );

                }


                if (
                    cards[index].revealed
                ) {

                    throw new Error(
                        "CARD_ALREADY_REVEALED"
                    );

                }


                const card =
                    cards[index];


                cards[index] = {

                    ...card,

                    revealed:
                        true

                };


                /*
                ------------------------------------------------
                ASSASSIN
                ------------------------------------------------
                */

                if (
                    card.type ===
                    "assassin"
                ) {

                    const winner =
                        room.currentTeam ===
                            "blue"
                            ? "red"
                            : "blue";


                    transaction.update(
                        roomRef,
                        {

                            cards,

                            status:
                                "finished",

                            winner,

                            phase:
                                "finished"

                        }
                    );


                    return;

                }


                /*
                ------------------------------------------------
                CORRECT TEAM
                ------------------------------------------------
                */

                if (
                    card.type ===
                    room.currentTeam
                ) {

                    const scores = {

                        ...(room.scores || {
                            blue: 0,
                            red: 0
                        })

                    };


                    scores[
                        room.currentTeam
                    ] =
                        (
                            scores[
                                room.currentTeam
                            ] || 0
                        ) + 1;


                    const remaining =
                        countRemainingFromCards(
                            cards,
                            room.currentTeam
                        );


                    /*
                    --------------------------------------------
                    WIN
                    --------------------------------------------
                    */

                    if (
                        remaining === 0
                    ) {

                        transaction.update(
                            roomRef,
                            {

                                cards,

                                scores,

                                status:
                                    "finished",

                                winner:
                                    room.currentTeam,

                                phase:
                                    "finished"

                            }
                        );


                        return;

                    }


                    /*
                    --------------------------------------------
                    CORRECT GUESS
                    --------------------------------------------

                    Team keeps guessing.
                    */

                    transaction.update(
                        roomRef,
                        {

                            cards,

                            scores

                        }
                    );


                    return;

                }


                /*
                ------------------------------------------------
                WRONG TEAM / NEUTRAL
                ------------------------------------------------
                */

                const nextTeam =
                    room.currentTeam ===
                        "blue"
                        ? "red"
                        : "blue";


                transaction.update(
                    roomRef,
                    {

                        cards,

                        currentTeam:
                            nextTeam,

                        phase:
                            "clue",

                        clue:
                            "",

                        clueNumber:
                            0,

                        clueByName:
                            "",

                        clueById:
                            "",

                        clueTeam:
                            ""

                    }
                );

            }
        );


        lastRenderedRoomState =
            "";

    }

    catch (error) {

        console.error(
            "Guess error:",
            error
        );


        if (
            error.message ===
            "NOT_YOUR_TURN"
        ) {

            alert(
                currentLanguage === "ar"
                    ? "انتهى دور فريقك."
                    : "Your team's turn has ended."
            );

        }

        else if (
            error.message ===
            "CARD_ALREADY_REVEALED"
        ) {

            return;

        }

        else if (
            error.message ===
            "ROOM_NOT_FOUND"
        ) {

            alert(
                currentLanguage === "ar"
                    ? "الغرفة غير موجودة."
                    : "Room not found."
            );

        }

    }

}


/* =========================================================
   MANUAL END TURN
========================================================= */

async function endTurnManually() {

    if (
        !currentPlayer ||
        !currentRoom
    ) {

        return;

    }


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


    await endTurn(
        currentRoom.cards,
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

    if (
        !currentRoom
    ) {

        return;

    }


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

            clueByName:
                "",

            clueById:
                "",

            clueTeam:
                ""

        }
    );


    selectedClueCards.clear();

    lastRenderedRoomState =
        "";

}


/* =========================================================
   SCORES
========================================================= */

function renderScores(
    gameScreen
) {

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


    const blueScore =
        countRevealed(
            "blue"
        );


    const redScore =
        countRevealed(
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
                ${blueScore}
            </strong>

            <small>
                ${
                    currentLanguage === "ar"
                        ? `متبقي ${blueRemaining}`
                        : `${blueRemaining} left`
                }
            </small>

        </div>


        <div class="score red-score">

            🔴

            ${
                currentLanguage === "ar"
                    ? "أحمر"
                    : "Red"
            }

            <strong>
                ${redScore}
            </strong>

            <small>
                ${
                    currentLanguage === "ar"
                        ? `متبقي ${redRemaining}`
                        : `${redRemaining} left`
                }
            </small>

        </div>
        `;


    gameScreen.appendChild(
        info
    );

}


/* =========================================================
   GAME OVER
========================================================= */

function renderGameOver(
    gameScreen
) {

    if (
        currentRoom.status !==
        "finished"
    ) {

        return;

    }


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


    const winnerName =
        currentRoom.winner ===
            "blue"

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
        `;


    overlay.appendChild(
        card
    );


    gameScreen.appendChild(
        overlay
    );

}


/* =========================================================
   COUNT REMAINING
========================================================= */

function countRemaining(
    team
) {

    if (
        !currentRoom ||
        !Array.isArray(
            currentRoom.cards
        )
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

    if (
        !Array.isArray(cards)
    ) {

        return 0;

    }


    return cards.filter(
        card =>
            card.type === team &&
            !card.revealed
    ).length;

}


function countRevealed(
    team
) {

    if (
        !currentRoom ||
        !Array.isArray(
            currentRoom.cards
        )
    ) {

        return 0;

    }


    return currentRoom.cards.filter(
        card =>
            card.type === team &&
            card.revealed
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

                            if (
                                $("copyRoomButton")
                            ) {

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

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(
    array
) {

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