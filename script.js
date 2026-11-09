const storageKey = "crop-profit-plans-v1";
const form = document.querySelector("#plan-form");
const planner = document.querySelector("#planner");
const steps = [...form.querySelectorAll(".flow-step")];
const progressItems = [...document.querySelectorAll(".progress-item")];
const titleInput = document.querySelector("#presentation-title");
const titleError = document.querySelector("#title-error");
const titleField = document.querySelector("#title-field");
const titleHelp = document.querySelector("#title-help");
const titleCount = document.querySelector("#title-count");
const nicknameInput = document.querySelector("#nickname");
const qnaOption = document.querySelector("#qna-option");
const qnaOptions = document.querySelector("#qna-options");
const qnaInputs = document.querySelectorAll('input[name="qna-count"]');
const agreeCheck = document.querySelector("#agreeCheck");
const startButton = document.querySelector("#startButton");
const recordingDialog = document.querySelector("#recording-dialog");
const planDialog = document.querySelector("#plan-dialog");
const planList = document.querySelector("#plan-list");
const archiveStatus = document.querySelector("#archive-status");
let currentStep = 1;

const saveButton = document.querySelector("#save-plan");
const submitStatus = document.querySelector("#submit-status");
const completeMessage = document.querySelector("#complete-message");
let isSubmitting = false;

function readPlans() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(stored)) return [];

    return stored
      .filter((plan) =>
        plan &&
        typeof plan.id === "string" &&
        typeof plan.title === "string" &&
        plan.title.trim()
      )
      .map((plan) => ({
        id: plan.id,
        title: plan.title.trim().slice(0, 60),
        nickname: typeof plan.nickname === "string"
          ? plan.nickname.slice(0, 10)
          : "",
        duration: ["3", "6", "12"].includes(plan.duration)
          ? plan.duration
          : "6",
        qna: plan.qna === true,
        qnaCount: ["1", "2", "3"].includes(plan.qnaCount)
          ? plan.qnaCount
          : "2",
        cancelled: plan.cancelled === true,
        createdAt: typeof plan.createdAt === "string"
          ? plan.createdAt
          : ""
      }));
  } catch {
    return [];
  }
}

let plans = readPlans();

function savePlans() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

function storageNotice(saved) {
  return saved
    ? ""
    : " 브라우저 저장 공간을 사용할 수 없어 이 변경은 새로고침 후 유지되지 않을 수 있습니다.";
}

function showStep(number) {
  currentStep = number;

  steps.forEach((step) => {
    step.hidden = Number(step.dataset.step) !== number;
  });

  progressItems.forEach((item, index) => {
    const current = index === number - 1;

    item.classList.toggle("is-current", current);
    item.classList.toggle("is-done", index < number - 1);

    if (current) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });

  const heading = steps[number - 1].querySelector("h3");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  planner.scrollIntoView({
    block: "start",
    behavior: reduced ? "auto" : "smooth"
  });
}

function updateAgreement() {
  startButton.disabled = !agreeCheck.checked;

  document.querySelector("#agreeMessage").textContent = agreeCheck.checked
    ? "안내를 확인하고 재배 계획 설정을 시작해 주세요."
    : "동의 후 재배 계획을 설정할 수 있습니다.";

  document.querySelector("#agreeMessage").classList.toggle(
    "is-ready",
    agreeCheck.checked
  );

  if (!agreeCheck.checked) planner.hidden = true;
}

function cancelAgreement() {
  recordingDialog.close();
  agreeCheck.checked = false;
  updateAgreement();
  agreeCheck.focus();
}

agreeCheck.addEventListener("change", updateAgreement);

startButton.addEventListener("click", () => {
  if (agreeCheck.checked) recordingDialog.showModal();
});

document.querySelector("#recording-cancel").addEventListener(
  "click",
  cancelAgreement
);

recordingDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  cancelAgreement();
});

document.querySelector("#recording-confirm").addEventListener("click", () => {
  if (!agreeCheck.checked) return;

  recordingDialog.close();
  planner.hidden = false;
  showStep(currentStep);

  if (currentStep === 1) titleInput.focus();
});

function updateTitleExperience() {
  const titleCount = document.querySelector("#title-count");
  const titleHelp = document.querySelector("#title-help");
  const titleField = titleInput.closest(".field");

  const length = titleInput.value.length;
  const title = titleInput.value.trim();
  const valid = title.length >= 1 && title.length <= 60;
  const hasError = titleInput.getAttribute("aria-invalid") === "true";

  titleCount.textContent = `${length} / 60자`;

  titleField.classList.toggle("has-error", hasError);
  titleField.classList.toggle("is-valid", valid && !hasError);

  titleHelp.textContent = hasError
    ? "작물 이름을 다시 확인해 주세요."
    : valid
      ? "입력 조건을 충족했습니다."
      : "작물 이름을 1자 이상 60자 이하로 입력해 주세요.";
}

function validateTitle(focus = true) {
  const title = titleInput.value.trim();
  if (!title) {
    titleError.textContent = "작물 이름을 입력해 주세요. 공백만으로는 진행할 수 없습니다.";
    titleInput.setAttribute("aria-invalid", "true");
    updateTitleExperience();
    if (focus) titleInput.focus();
    return false;
  }

  if (title.length > 60) {
    titleError.textContent =
      "작물 이름은 60자 이내로 입력해 주세요.";
    titleInput.setAttribute("aria-invalid", "true");
    updateTitleExperience();
    if (focus) titleInput.focus();
    return false;
  }

  titleError.textContent = "";
  titleInput.removeAttribute("aria-invalid");

  return true;
}

function getFormValues() {
  return {
    title: titleInput.value.trim(),
    nickname: nicknameInput.value.trim(),
    duration: form.querySelector(
      'input[name="duration"]:checked'
    ).value,
    qna: qnaOption.checked,
    qnaCount: form.querySelector(
      'input[name="qna-count"]:checked'
    ).value
  };
}

function costText(plan) {
  const levels = {
    "1": "낮음",
    "2": "보통",
    "3": "높음"
  };

  return plan.qna
    ? `${levels[plan.qnaCount]} 수준 반영`
    : "미반영";
}

function updateSummary() {
  const values = getFormValues();

  document.querySelector("#summary-title").textContent = values.title;
  document.querySelector("#summary-nickname").textContent =
    values.nickname || "입력 안 함";
  document.querySelector("#summary-duration").textContent =
    `${values.duration}개월`;
  document.querySelector("#summary-qna").textContent = costText(values);
  document.querySelector("#save-error").textContent = "";
}

const saveButton = document.querySelector("#save-plan");
const submitStatus = document.querySelector("#submit-status");
let isSubmitting = false;

function setSubmitState(state, message) {
  isSubmitting = state === "loading";

  form.setAttribute("aria-busy", String(isSubmitting));

  saveButton.disabled = isSubmitting;
  saveButton.textContent = isSubmitting
    ? "저장하는 중..."
    : "재배 계획 저장하기";

  submitStatus.textContent = message;

  submitStatus.classList.toggle("is-success", state === "success");
  submitStatus.classList.toggle("is-error", state === "error");
}

titleInput.addEventListener("input", () => {
  if (titleInput.getAttribute("aria-invalid") === "true") {
    validateTitle(false);
  }

  updateTitleExperience();
});

updateTitleExperience();

nicknameInput.addEventListener("input", () => {
  document.querySelector("#nickname-count").textContent =
    `${nicknameInput.value.length} / 10자`;
});

qnaOption.addEventListener("change", () => {
  qnaOptions.hidden = !qnaOption.checked;
});

function syncQnaOptions() {
  const open = qnaOption.checked;
  qnaOption.setAttribute("aria-expanded", String(open));
  qnaOptions.hidden = !open;
  qnaInputs.forEach((input) => {
    input.disabled = !open;
  });
}

qnaOption.addEventListener("change", syncQnaOptions);
syncQnaOptions();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (currentStep === 1) {
    if (validateTitle()) showStep(2);
    return;
  }
  if (currentStep !== 3 || isSubmitting) return;

  if (!validateTitle()) {
    showStep(1);
    titleInput.focus();
    return;
  }

  setSubmitState("loading", "재배 계획을 저장하는 중입니다...");
  window.setTimeout(() => {
    if (!saveCurrentPlan()) {
      setSubmitState("error", "재배 계획을 저장하지 못했습니다. 같은 조건의 계획이 이미 있는지 확인해 주세요.");
      return;
    }
    setSubmitState("success", "재배 계획을 저장했습니다. 내 계획에서 확인할 수 있습니다.");
    showStep(4);
  }, 600);
});

document.querySelector("#info-next").addEventListener("click", () => {
  if (validateTitle()) showStep(2);
});

document.querySelector("#option-prev").addEventListener("click", () => {
  showStep(1);
});

document.querySelector("#option-next").addEventListener("click", () => {
  updateSummary();
  showStep(3);
});

document.querySelector("#edit-info").addEventListener("click", () => {
  showStep(1);
});

document.querySelector("#edit-options").addEventListener("click", () => {
  showStep(2);
});

function saveCurrentPlan() {
  const values = getFormValues();

  document.querySelector("#save-error").textContent = "";

  const duplicate = plans.some((plan) =>
    plan.title === values.title &&
    plan.nickname === values.nickname &&
    plan.duration === values.duration &&
    plan.qna === values.qna &&
    (!values.qna || plan.qnaCount === values.qnaCount)
  );

  if (duplicate) {
    document.querySelector("#save-error").textContent =
      "같은 조건의 재배 계획이 이미 있습니다. 내 계획에서 확인하거나, 취소된 계획이라면 ‘취소 되돌리기’를 눌러 주세요.";

    return false;
  }

  const plan = {
    id: typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    ...values,
    cancelled: false,
    createdAt: new Date().toISOString()
  };

  plans.unshift(plan);

  if (!savePlans()) {
    plans.shift();
    return false;
  }

  renderPlans();

  archiveStatus.textContent =
    `‘${plan.title}’ 재배 계획을 저장했습니다.`;

  document.querySelector("#complete-message").textContent =
    `‘${plan.title}’ 재배 계획을 내 계획에서 다시 열어볼 수 있습니다.`;

  return true;
}

document.querySelector("#restart-button").addEventListener("click", () => {
  form.reset();
  syncQnaOptions();

  titleInput.removeAttribute("aria-invalid");
  titleError.textContent = "";

  updateTitleExperience();
  setSubmitState("idle", "");
  document.querySelector("#nickname-count").textContent = "0 / 10자";
  document.querySelector("#save-error").textContent = "";
  document.querySelector("#complete-message").textContent = "";

  form.querySelectorAll(".summary-list dd").forEach((item) => {
    item.textContent = "";
  });

  showStep(1);
  titleInput.focus();
});

function createText(tag, className, content) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = content;
  return element;
}

function renderPlans() {
  planList.replaceChildren();

  document.querySelector("#empty-state").hidden = plans.length > 0;
  planList.hidden = plans.length === 0;

  const activeCount = plans.filter(
    (plan) => !plan.cancelled
  ).length;

  document.querySelector("#plan-count").textContent = String(activeCount);
  document.querySelector("#plan-count").setAttribute(
    "aria-label",
    `취소하지 않은 계획 ${activeCount}개`
  );

  plans.forEach((plan) => {
    const card = document.createElement("li");
    card.className =
      `plan-card${plan.cancelled ? " is-cancelled" : ""}`;

    const top = document.createElement("div");
    top.className = "plan-card-top";

    top.append(createText(
      "span",
      "plan-state",
      plan.cancelled ? "취소됨" : "저장됨"
    ));

    const date = new Date(plan.createdAt);

    if (!Number.isNaN(date.getTime())) {
      top.append(createText(
        "span",
        "plan-date",
        date.toLocaleDateString("ko-KR")
      ));
    }

    card.append(
      top,
      createText("h3", "plan-title", plan.title)
    );

    card.append(createText(
      "p",
      "plan-meta",
      `${plan.nickname || "지역 미입력"} · ${plan.duration}개월 · 생산비 ${costText(plan)}`
    ));

    const actions = document.createElement("div");
    actions.className = "plan-actions";

    const buttons = [
      ["open", "내용 보기", "button-secondary"],
      [
        "toggle",
        plan.cancelled ? "취소 되돌리기" : "계획 취소하기",
        "button-text"
      ],
      ["delete", "삭제", "button-danger"]
    ];

    buttons.forEach(([action, label, style]) => {
      const button = createText(
        "button",
        `button ${style}`,
        label
      );

      button.type = "button";
      button.dataset.action = action;
      button.dataset.id = plan.id;
      button.setAttribute(
        "aria-label",
        `${plan.title} 계획 ${label}`
      );

      actions.append(button);
    });

    card.append(actions);
    planList.append(card);
  });
}

planList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const plan = plans.find(
    (item) => item.id === button.dataset.id
  );
  if (!plan) return;

  const action = button.dataset.action;

  if (action === "open") {
    document.querySelector("#dialog-title").textContent = plan.title;
    document.querySelector("#dialog-status").textContent = plan.cancelled
      ? "취소된 재배 계획입니다."
      : "저장된 재배 계획입니다.";

    document.querySelector("#dialog-nickname").textContent =
      plan.nickname || "입력 안 함";
    document.querySelector("#dialog-duration").textContent =
      `${plan.duration}개월`;
    document.querySelector("#dialog-qna").textContent = costText(plan);

    planDialog.showModal();
    return;
  }

  let message;

  if (action === "delete") {
    plans = plans.filter((item) => item.id !== plan.id);
    message = `‘${plan.title}’ 계획을 삭제했습니다.`;
  } else if (action === "toggle") {
    plan.cancelled = !plan.cancelled;
    message =
      `‘${plan.title}’ 계획을 ${plan.cancelled ? "취소했습니다" : "다시 사용할 수 있습니다"}.`;
  } else {
    return;
  }

  const saved = savePlans();

  renderPlans();
  archiveStatus.textContent = message + storageNotice(saved);

  const next = [...planList.querySelectorAll("button")].find(
    (item) =>
      item.dataset.id === plan.id &&
      item.dataset.action === action
  );

  (
    next ||
    planList.querySelector("button") ||
    document.querySelector("#empty-start")
  ).focus();
});

document.querySelector("#dialog-close").addEventListener("click", () => {
  planDialog.close();
});

document.querySelector("#dialog-done").addEventListener("click", () => {
  planDialog.close();
});

document.querySelector("#themeButton").addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");

  document.querySelector("#themeButton").textContent =
    dark ? "라이트 모드" : "다크 모드";

  document.querySelector("#themeButton").setAttribute(
    "aria-pressed",
    String(dark)
  );
});

const tabs = [...document.querySelectorAll(".tab")];

function activateTab(selected) {
  tabs.forEach((tab) => {
    const active = tab === selected;

    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;

    document.getElementById(
      tab.getAttribute("aria-controls")
    ).hidden = !active;
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));

  tab.addEventListener("keydown", (event) => {
    const targets = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1
    };

    if (!(event.key in targets)) return;

    event.preventDefault();

    const next = tabs[targets[event.key]];
    activateTab(next);
    next.focus();
  });
});

document.querySelector("#subscribe-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.querySelector("#email");
  const message = document.querySelector("#subscribeMessage");

  if (document.querySelector("#subscribeButton").disabled) return;

  email.value = email.value.trim();

  if (!email.checkValidity()) {
    message.textContent = email.value
      ? "이메일 형식을 확인해 주세요. 예: farmer@example.com"
      : "이메일을 입력해 주세요.";

    message.className = "is-error";
    email.setAttribute("aria-invalid", "true");
    email.focus();
    return;
  }

  email.removeAttribute("aria-invalid");

  message.textContent =
    `${email.value}로 작물별 가격 동향과 수익 예측 소식 신청을 완료했습니다. 체험용 화면으로 실제 이메일은 발송되지 않습니다.`;

  message.className = "is-success";
  document.querySelector("#subscribeButton").textContent = "신청 완료";
  document.querySelector("#subscribeButton").disabled = true;
  email.readOnly = true;
});

updateAgreement();
renderPlans();