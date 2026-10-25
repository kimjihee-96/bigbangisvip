const serviceName = "청년 농부를 위한 작물 수익 예측 서비스";
let isSubscribed = false;
let submitCount = 0;

function makeSubscribeMessage(email, subscribed) {
    if (subscribed == true) {
        return email + "로 작물별 가격 동향과 수익 예측 소식 신청이 완료되었습니다.";
    }
    
    return "이메일을 입력한 뒤 신청해주세요.";
}

const subscribeForm = document.querySelector("#subscribe-form");
const emailInput = document.querySelector("#email");
const subscribeButton = document.querySelector("#subscribeButton");
const subscribeMessage = document.querySelector("#subscribeMessage");

function handleSubscribe(event) {
    event.preventDefault();

    const subscriberEmail = emailInput.value.trim();

    if (subscriberEmail === "") {
        subscribeMessage.textContent =
            "이메일을 입력한 뒤 신청해주세요.";
        emailInput.focus();
        return;
    }

    isSubscribed = true;
    submitCount += 1;

    subscribeMessage.textContent =
        makeSubscribeMessage(subscriberEmail, isSubscribed);

    subscribeMessage.classList.add("is-success");

    subscribeButton.textContent = "신청 완료";
    subscribeButton.disabled = true;
}

subscribeForm.addEventListener("submit", handleSubscribe);

const themeButton = document.querySelector("#themeButton");
const nicknameInput = document.querySelector("#nickname");
const nicknameCount = document.querySelector("#nicknameCount");
const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");
const startButton = document.querySelector("#startButton");

function handleThemeButtonClick() {
    const isDark = document.body.classList.toggle("dark");

    themeButton.textContent = isDark ? "라이트 테마로 바꾸기" : "다크 테마로 바꾸기";
}

themeButton.addEventListener("click", handleThemeButtonClick);

function handleNicknameInput() {
    const maxLength = nicknameInput.maxLength;
    const currentLength = Math.min(nicknameInput.value.length, maxLength);
    
    nicknameCount.textContent = currentLength + " / " + maxLength;
}

nicknameInput.addEventListener("input", handleNicknameInput);

function handleAgreeCheckChange() {
    const agreed = agreeCheck.checked;

    startButton.disabled = !agreed;
    agreeMessage.textContent = agreed 
    ? "수익 예측을 시작할 수 있습니다"
    : "동의 후 수익 예측을 시작할 수 있습니다.";

    if(agreed) {
        agreeMessage.classList.remove("is-ready");
    } else {
        agreeMessage.classList.add("is-ready");
    }
}

agreeCheck.addEventListener("change", handleAgreeCheckChange);

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function resetTabsAndPanels() {
    tabs.forEach(function (tab) {
        tab.classList.remove("is-active");
        tab.setAttribute("aria-selected", "false")
    });
    panels.forEach(function (panel) {
        panel.classList.remove("is-active");
        panel.hidden = true;
    });
}

function activateTab(clickedTab) {
    const targetSelector = clickedTab.dataset.target;
    const targetpanel = document.querySelector(targetSelector);

    clickedTab.classList.add("is-active");
    clickedTab.setAttribute("aria-selected", "true");

    targetpanel.classList.add("is-active");
    targetpanel.hidden = false;
}

function handleTabClick(event) {
    resetTabsAndPanels();
    activateTab(event.currentTarget);
}

tabs.forEach(function (tab) {
    tab.addEventListener("click", handleTabClick);
});

const traingFlow = document.querySelector("#training-flow");
const flowSteps = traingFlow.querySelectorAll(".step");
const progressItems = traingFlow.querySelectorAll(".progress__item");
const titleInput = document.querySelector("#presentation-title");
const titleError = document.querySelector("#title-error");
const titleNext = document.querySelector("#title-next");
const durationRange = document.querySelector("#duration-range");
const durationValue = document.querySelector("#duration-value");
const qnaOption = document.querySelector("#qna-option");
const qnaOptions = document.querySelector("#qna-options");
const optionPrev = document.querySelector("#option-prev");
const optionNext = document.querySelector("#option-next");
const summaryPrev = document.querySelector("#summary-prev");
const finishButton = document.querySelector("#finish-button");
const restartButton = document.querySelector("#restart-button");
const summaryTitle = document.querySelector("#summary-title");
const summaryDuration = document.querySelector("#summary-duration");
const summaryQna = document.querySelector("#summary-qna");
const durationValues = ["3", "6", "12"];

const formData = {
    title: "", duration: "6", qna: false, qnaCount: "2"
};

function showStep(index) {
    flowSteps.forEach((step, i) => { step.hidden = i !== index; });
    progressItems.forEach((item, i) => {
        item.classList.toggle("is-active", i === index);
    });
}

const recordingDialog = document.querySelector("#recording-dialog");
const recordingCancel = document.querySelector("#recording-cancel");
const recordingConfirm = document.querySelector("#recording-confirm");

function revokeRecordingAgreement() {
    agreeCheck.checked = false;
    traingFlow.hidden = true;
    handleAgreeChange();
    agreeCheck.focus();
}

startButton.addEventListener("click", () => {
    if (!agreeCheck.checked) return;
    recordingDialog.showModal();
});

recordingCancel.addEventListener("click", () => {
    recordingDialog.close();
    revokeRecordingAgreement();
});

recordingDialog.addEventListener("cancel", revokeRecordingAgreement);

recordingConfirm.addEventListener("click", () => {
    if (!agreeCheck.checked) return;
    recordingDialog.close();
    traingFlow.hidden = false;
    showStep(0);
    traingFlow.scrollIntoView({ behavior: "smooth" });
    titleInput.focus();
});

function validateTitle() {
    const value = titleInput.value.trim();
    if (!value) {
        titleError.textContent = "작물 이름을 입력해 주세요.";
        titleInput.classList.add("has-error");
        titleInput.focus();
        return false;
    }
    titleError.textContent = "";
    titleInput.classList.remove("has-error");
    formData.title = value;
    return true;
}

titleNext.addEventListener("click", () => {
    if (!validateTitle()) return;
    showStep(1);
});

durationRange.addEventListener("input", () => {
    durationValue.value = durationValues[durationRange.value] + "개월";
});

qnaOption.addEventListener("change", () => {
    qnaOptions.hidden = !qnaOption.checked;
});

optionPrev.addEventListener("click", () => showStep(0));

optionNext.addEventListener("click", () => {
    formData.duration = durationValues[durationRange.value];
    formData.qna = qnaOption.checked;
    const count = document.querySelector('input[name="qna-count"]:checked');
    formData.qnaCount = count.value;

    const costLevels = ["낮음", "보통", "높음"];

    summaryTitle.textContent = formData.title;
    summaryDuration.textContent = formData.duration + "개월";
    summaryQna.textContent = formData.qna
        ? costLevels[Number(formData.qnaCount) - 1] + " 수준 반영"
        : "미반영";

    showStep(2);
});

summaryPrev.addEventListener("click", () => showStep(1));
finishButton.addEventListener("click", () => showStep(3));
restartButton.addEventListener("click", () => {
    formData.title = "";
    formData.duration = "6";
    formData.qna = false;
    formData.qnaCount = "2";
    titleInput.value = "";
    titleError.textContent = "";
    titleInput.classList.remove("has-error");
    durationRange.value = "1";
    durationValue.value = "6개월";
    qnaOption.checked = false;
    qnaOptions.hidden = true;
    document.querySelector('input[name="qna-count"][value="2"]').checked = true;
    summaryTitle.textContent = "";
    summaryDuration.textContent = "";
    summaryQna.textContent = "";
    showStep(0);
});

const planSaveButton = document.querySelector("#plan-save");
const savedPlanSection = document.querySelector("#saved-plans");
const savedPlanList = document.querySelector("#saved-plan-list");
const savedPlanEmpty = document.querySelector("#saved-plan-empty");
const savedPlanMessage = document.querySelector("#saved-plan-message");
const savedPlanDetail = document.querySelector("#saved-plan-detail");
const savedPlanDetailText = document.querySelector("#saved-plan-detail-text");
const savedPlanClose = document.querySelector("#saved-plan-close");
const completedPlanStep = document.querySelector('#training-flow .step[data-step="4"]');

const savedPlans = [];
let savedPlanSerial = 0;

function showSavedPlanMessage(message, isError) {
    savedPlanMessage.textContent = message;
    savedPlanMessage.classList.toggle("is-error", isError);
}

function renderSavedPlans() {
    savedPlanList.textContent = "";
    savedPlanEmpty.hidden = savedPlans.length > 0;

    savedPlans.forEach(function (plan) {
        const item = document.createElement("li");
        const name = document.createElement("strong");
        name.className = "plan-name";
        name.textContent = plan.title;

        const actions = document.createElement("div");
        actions.className = "saved-plan-actions";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.textContent = "내용 보기";

        openButton.addEventListener("click", function () {
            const levels = ["낮음", "보통", "높음"];
            const cost = plan.qna
                ? levels[Number(plan.qnaCount) - 1] + " 수준 반영"
                : "미반영";

            savedPlanDetailText.textContent = "작물 이름: " + plan.title
                + "\n예측 기간: " + plan.duration + "개월"
                + "\n생산비: " + cost;

            savedPlanDetail.dataset.planId = String(plan.id);
            savedPlanDetail.hidden = false;
            showSavedPlanMessage("저장한 계획을 열었습니다.", false);
            savedPlanDetail.scrollIntoView({ behavior: "smooth" });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "삭제";

        deleteButton.addEventListener("click", function () {
            const index = savedPlans.findIndex(function (item) {
                return item.id === plan.id;
            });

            if (index === -1) return;

            savedPlans.splice(index, 1);

            if (savedPlanDetail.dataset.planId === String(plan.id)) {
                savedPlanDetail.hidden = true;
                savedPlanDetailText.textContent = "";
            }

            renderSavedPlans();
            showSavedPlanMessage(plan.title + " 계획을 삭제했습니다.", false);
        });

        actions.append(openButton, deleteButton);
        item.append(name, actions);
        savedPlanList.append(item);
    });
}

planSaveButton.addEventListener("click", function () {
    if (completedPlanStep.hidden || !formData.title.trim()) {
        showSavedPlanMessage(
            "작물 이름과 예측 조건을 설정하고 완료한 뒤 저장해 주세요.",
            true
        );
        return;
    }

    const plan = {
        id: ++savedPlanSerial,
        title: formData.title.trim(),
        duration: formData.duration,
        qna: formData.qna,
        qnaCount: formData.qnaCount
    };

    const duplicated = savedPlans.some(function (item) {
        return item.title === plan.title
            && item.duration === plan.duration
            && item.qna === plan.qna
            && (!plan.qna || item.qnaCount === plan.qnaCount);
    });

    if (duplicated) {
        showSavedPlanMessage(
            "같은 조건의 계획이 이미 있습니다. 목록에서 내용을 보거나, 다시 설정해 다른 조건을 저장해 주세요.",
            true
        );
        savedPlanSection.scrollIntoView({ behavior: "smooth" });
        return;
    }

    savedPlans.push(plan);
    renderSavedPlans();

    showSavedPlanMessage(
        plan.title + " 계획을 저장했습니다. ‘내용 보기’를 눌러 확인하세요.",
        false
    );

    savedPlanSection.scrollIntoView({ behavior: "smooth" });
});

savedPlanClose.addEventListener("click", function () {
    savedPlanDetail.hidden = true;
});

renderSavedPlans();