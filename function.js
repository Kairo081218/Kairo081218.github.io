document.addEventListener("DOMContentLoaded", () => {
  console.log("HelpFit website is loaded and ready.");
  // ===== 여기부터 추가 =====
  const checkLoginStatus = () => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const loginInfoCard = document.querySelector(
      ".info-card:has(.auth-buttons)"
    );

    if (isLoggedIn === "true" && loginInfoCard) {
      loginInfoCard.remove();
    }
  };

  checkLoginStatus();
  // ===== 여기까지 추가 =====

  // --- START: Live Coaching Booking Logic ---
  const trainerGrid = document.querySelector(".trainer-grid");
  if (trainerGrid) {
    const bookingModal = document.getElementById("booking-modal");
    const loadingOverlay = document.getElementById("loading-overlay-booking");
    const bookingForm = document.getElementById("booking-form");
    const cancelBookingBtn = document.getElementById("cancel-booking");
    const modalTitle = document.getElementById("booking-trainer-name");

    if (
      bookingModal &&
      loadingOverlay &&
      bookingForm &&
      cancelBookingBtn &&
      modalTitle
    ) {
      let currentBookingButton = null;

      trainerGrid.addEventListener("click", (e) => {
        e.preventDefault();
        const targetButton = e.target.closest(".btn-book");
        if (targetButton) {
          currentBookingButton = targetButton;
          const trainerCard = targetButton.closest(".trainer-card");
          const trainerName = trainerCard.querySelector("h3").textContent;

          modalTitle.textContent = `${trainerName}와(과) 예약`;
          bookingModal.style.display = "flex";
        }
      });

      cancelBookingBtn.addEventListener("click", () => {
        bookingModal.style.display = "none";
      });

      bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const timeInput = document.getElementById("booking-time");
        if (!timeInput.value) {
          alert("원하는 시간을 선택해주세요.");
          return;
        }

        // 1. Close modal, show loading spinner
        bookingModal.style.display = "none";
        loadingOverlay.style.display = "flex";

        // 2. Update button to "Pending" state
        if (currentBookingButton) {
          currentBookingButton.textContent = "🟡 예약중...";
          currentBookingButton.classList.remove("btn-book");
          currentBookingButton.classList.add("btn-pending");
        }

        // 3. Simulate 3-second loading time
        setTimeout(() => {
          loadingOverlay.style.display = "none";

          if (currentBookingButton) {
            const trainerName = currentBookingButton
              .closest(".trainer-card")
              .querySelector("h3").textContent;
            alert(`${trainerName} 트레이너가 예약을 수락했습니다!`);

            // 4. Update button to "Booked" state
            currentBookingButton.textContent = "🔴 예약 완료";
            currentBookingButton.classList.remove("btn-pending");
            currentBookingButton.classList.add("btn-unavailable");
          }

          // Reset form and state
          bookingForm.reset();
          currentBookingButton = null;
        }, 3000);
      });
    }
  }
  // --- END: Live Coaching Booking Logic ---

  // --- START: plan.html to level_pt.html filtering logic ---

  // Logic for plan.html
  const planGridForFiltering = document.querySelector(".plan-grid");
  if (planGridForFiltering) {
    planGridForFiltering.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-start")) {
        e.preventDefault(); // Prevent default link behavior
        const targetCard = e.target.closest(".day-card");
        const selectedWorkout =
          targetCard.querySelector(".workout-select").value;

        // "휴식" is not a video category, so handle it.
        if (selectedWorkout === "휴식") {
          alert("오늘은 휴식일입니다! 편안한 하루 보내세요.");
          return;
        }

        // Encode the selected workout and pass it as a URL parameter
        const hashtag = encodeURIComponent(selectedWorkout);
        window.location.href = `level_pt.html?hashtag=${hashtag}`;
      }
    });
  }

  // Logic for level_pt.html
  const videoGridForFiltering = document.querySelector(".video-grid");
  if (videoGridForFiltering) {
    const urlParams = new URLSearchParams(window.location.search);
    const hashtagFilter = urlParams.get("hashtag");

    if (hashtagFilter) {
      const decodedHashtag = decodeURIComponent(hashtagFilter);
      const videoCards = document.querySelectorAll(".pt-video-card");

      videoCards.forEach((card) => {
        const cardHashtagEl = card.querySelector(".hashtags");
        if (cardHashtagEl) {
          const cardHashtag = cardHashtagEl.textContent.trim();
          // Compare the hashtag from URL with the card's hashtag, ignoring spaces
          if (
            cardHashtag.substring(1).replace(/\s/g, "") ===
            decodedHashtag.replace(/\s/g, "")
          ) {
            card.style.display = "block"; // Show matching card
          } else {
            card.style.display = "none"; // Hide non-matching card
          }
        }
      });
    }
  }

  // --- END: plan.html to level_pt.html filtering logic ---

  const container = document.querySelector(".carousel-container");
  if (container) {
    const slider = container.querySelector(".carousel-slider");
    if (slider) {
      let items = Array.from(slider.querySelectorAll(".carousel-item"));
      const prevBtn = container.querySelector(".prev-btn");
      const nextBtn = container.querySelector(".next-btn");

      if (items.length > 0 && prevBtn && nextBtn) {
        const itemsToShow = 1; // Number of items to clone for smooth transition
        let currentIndex = itemsToShow;
        let isTransitioning = false;

        // Clone first and last items for infinite loop effect
        for (let i = 0; i < itemsToShow; i++) {
          slider.appendChild(items[i].cloneNode(true));
        }
        for (let i = items.length - 1; i >= items.length - itemsToShow; i--) {
          slider.insertBefore(items[i].cloneNode(true), items[0]);
        }

        // Update items array with clones
        items = Array.from(slider.querySelectorAll(".carousel-item"));

        function updateCarousel(instant = false) {
          const currentItem = items[currentIndex];
          if (!currentItem) return;
          const viewportWidth = container.offsetWidth;
          const currentItemWidth = currentItem.offsetWidth;
          const currentItemOffsetLeft = currentItem.offsetLeft;
          const offset = (viewportWidth - currentItemWidth) / 2;
          let newX = -currentItemOffsetLeft + offset;

          if (instant) {
            slider.style.transition = "none";
          } else {
            slider.style.transition =
              "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
          }

          slider.style.transform = `translateX(${newX}px)`;

          // Update active class
          items.forEach((item, index) => {
            item.classList.toggle("active", index === currentIndex);
          });
        }

        function slideToNext() {
          if (isTransitioning) return;
          isTransitioning = true;
          currentIndex++;
          updateCarousel();
        }

        function slideToPrev() {
          if (isTransitioning) return;
          isTransitioning = true;
          currentIndex--;
          updateCarousel();
        }

        slider.addEventListener("transitionend", () => {
          isTransitioning = false;
          if (currentIndex >= items.length - itemsToShow) {
            currentIndex = itemsToShow;
            updateCarousel(true);
          }
          if (currentIndex < itemsToShow) {
            currentIndex = items.length - itemsToShow * 2;
            updateCarousel(true);
          }
        });

        nextBtn.addEventListener("click", slideToNext);
        prevBtn.addEventListener("click", slideToPrev);
        window.addEventListener("resize", () => updateCarousel(true));

        // Initial setup
        setTimeout(() => updateCarousel(true), 100);
      }
    }
  }

  // Workout Plan Page Logic
  const planGrid = document.querySelector(".plan-grid");
  if (planGrid) {
    const emojiMap = {
      "전신 근력": "💪",
      "상체 집중": "🏋️‍♂️",
      "하체 집중": "🦵",
      "유산소 인터벌": "🏃‍♂️",
      "요가/스트레칭": "🧘‍♀️",
      휴식: "😴",
    };

    // Function to update a card's text and emoji
    const updateCardContent = (card) => {
      const workoutSelect = card.querySelector(".workout-select");
      const workoutText = card.querySelector("p");
      const iconDiv = card.querySelector(".icon");
      if (workoutSelect && workoutText && iconDiv) {
        const selectedWorkout = workoutSelect.value;
        workoutText.textContent = selectedWorkout;
        iconDiv.textContent = emojiMap[selectedWorkout] || "🤸";
      }
    };

    // Initialize all cards on load
    planGrid.querySelectorAll(".day-card").forEach(updateCardContent);

    // Main click handler for the entire grid
    planGrid.addEventListener("click", (e) => {
      const targetCard = e.target.closest(".day-card");

      // If a day card was clicked (but not the dropdown or start button)
      if (
        targetCard &&
        !e.target.classList.contains("btn-start") &&
        e.target.tagName.toLowerCase() !== "select"
      ) {
        const currentSelected = planGrid.querySelector(".day-card.selected");
        if (currentSelected) {
          currentSelected.classList.remove("selected");
        }
        targetCard.classList.add("selected");
      }
    });

    // Handle dropdown changes separately
    planGrid.addEventListener("change", (e) => {
      if (e.target.classList.contains("workout-select")) {
        const targetCard = e.target.closest(".day-card");
        if (targetCard) {
          updateCardContent(targetCard);
        }
      }
    });
  }

  const routineOptions = document.querySelectorAll(".routine-options .option");
  const suggestionBox = document.querySelector(".suggestion-box");

  if (routineOptions.length > 0 && suggestionBox) {
    const recommendationGrid = suggestionBox.querySelector(
      ".recommendation-grid"
    );
    if (recommendationGrid) {
      const routineRecommendations = {
        "😫 몸이 조금 피곤해요": [
          {
            rank: "1순위",
            icon: "🧘‍♀️",
            title: "가벼운 스트레칭",
            desc: "몸을 부드럽게 풀어줍니다.",
          },
          {
            rank: "2순위",
            icon: "🚶‍♀️",
            title: "가벼운 걷기",
            desc: "혈액순환을 돕습니다.",
          },
          {
            rank: "3순위",
            icon: "😴",
            title: "휴식",
            desc: "에너지를 회복합니다.",
          },
        ],
        "🙂 평소와 같아요": [
          {
            rank: "1순위",
            icon: "🏃‍♂️",
            title: "유산소 인터벌",
            desc: "최고의 효율로 목표 달성!",
          },
          {
            rank: "2순위",
            icon: "💪",
            title: "전신 근력 운동",
            desc: "몸의 균형을 잡아줍니다.",
          },
          {
            rank: "3순위",
            icon: "🏋️‍♂️",
            title: "상체 집중",
            desc: "상체 근력을 강화합니다.",
          },
        ],
        "⚡️ 에너지가 넘쳐요!": [
          {
            rank: "1순위",
            icon: "🔥",
            title: "고강도 인터벌 (HIIT)",
            desc: "한계를 넘어서보세요!",
          },
          {
            rank: "2순위",
            icon: "🦵",
            title: "하체 집중",
            desc: "탄탄한 하체를 만듭니다.",
          },
          {
            rank: "3순위",
            icon: "🏃‍♂️",
            title: "장거리 달리기",
            desc: "심폐지구력을 향상시킵니다.",
          },
        ],
      };

      function renderRecommendations(condition) {
        recommendationGrid.innerHTML = ""; // Clear existing recommendations
        const recommendations = routineRecommendations[condition];
        if (!recommendations) return;

        recommendations.forEach((rec, index) => {
          const card = document.createElement("div");
          card.className = "recommend-card";
          card.innerHTML = `
                        <div class="rank">${rec.rank}</div>
                        <div class="icon">${rec.icon}</div>
                        <h4>${rec.title}</h4>
                        <p>${rec.desc}</p>
                        <a href="#" class="btn-start">시작하기</a>
                    `;
          // Select the first one by default
          if (index === 0) {
            card.classList.add("selected");
          }
          recommendationGrid.appendChild(card);
        });
      }

      routineOptions.forEach((option) => {
        option.addEventListener("click", () => {
          routineOptions.forEach((opt) => opt.classList.remove("active"));
          option.classList.add("active");
          const selectedCondition = option.textContent.trim();
          renderRecommendations(selectedCondition);
        });
      });

      recommendationGrid.addEventListener("click", (e) => {
        const targetCard = e.target.closest(".recommend-card");
        if (!targetCard) return;

        if (e.target.classList.contains("btn-start")) {
          e.preventDefault();
          const routineTitle = targetCard.querySelector("h4").textContent;
          alert(`'${routineTitle}' 루틴을 시작합니다!`);
        } else {
          const allCards =
            recommendationGrid.querySelectorAll(".recommend-card");
          allCards.forEach((card) => card.classList.remove("selected"));
          targetCard.classList.add("selected");
        }
      });

      // Initial load
      updateDietPlan();
    }
  }

  const accordionItems = document.querySelectorAll(
    ".accordion .accordion-item"
  );
  if (accordionItems.length > 0) {
    accordionItems.forEach((item) => {
      const title = item.querySelector(".accordion-title");
      if (title) {
        title.addEventListener("click", () => {
          // Close other items
          accordionItems.forEach((otherItem) => {
            if (otherItem !== item && otherItem.classList.contains("active")) {
              otherItem.classList.remove("active");
            }
          });

          // Toggle current item
          item.classList.toggle("active");
        });
      }
    });

    // Add click listener for video placeholders
    document.querySelectorAll(".video-placeholder").forEach((video) => {
      video.addEventListener("click", () => {
        alert("운동 영상을 재생합니다.");
      });
    });
  }

  const videoCards = document.querySelectorAll(".pt-video-card");
  if (videoCards.length > 0) {
    videoCards.forEach((card) => {
      card.addEventListener("click", () => {
        const videoTitleEl = card.querySelector("h3");
        if (videoTitleEl) {
          const videoTitle = videoTitleEl.textContent;
          alert(`'${videoTitle}' 영상을 재생합니다.`);
        }
      });
    });
  }

  const uploadBox = document.querySelector(".upload-box");
  if (uploadBox) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "video/mp4";
    fileInput.style.display = "none";

    uploadBox.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        alert(`${fileInput.files[0].name} 영상을 업로드합니다.`);
      }
    });

    uploadBox.appendChild(fileInput);
  }

  const trainerCards = document.querySelectorAll(".trainer-card");
  if (trainerCards.length > 0) {
    trainerCards.forEach((card) => {
      const btn = card.querySelector(".btn-profile");
      const trainerNameEl = card.querySelector("h3");
      if (btn && trainerNameEl) {
        const trainerName = trainerNameEl.textContent;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          if (btn.textContent.includes("예약 가능")) {
            alert(`${trainerName}님에게 예약을 신청합니다.`);
          } else {
            alert(`${trainerName}님은 현재 상담 중입니다.`);
          }
        });
      }
    });
  }

  const filterOptions = document.querySelectorAll(".routine-options .option");
  const trainerGridForFilter = document.querySelector(".trainer-grid");

  if (filterOptions.length > 0 && trainerGridForFilter) {
    const allTrainers = trainerGridForFilter.querySelectorAll(".trainer-card");

    filterOptions.forEach((option) => {
      option.addEventListener("click", () => {
        filterOptions.forEach((opt) => opt.classList.remove("active"));
        option.classList.add("active");

        const filter = option.textContent.trim();

        allTrainers.forEach((trainer) => {
          const specialtyEl = trainer.querySelector(".specialty");
          if (specialtyEl) {
            const specialty = specialtyEl.textContent;
            if (filter === "전체" || specialty.includes(filter)) {
              trainer.style.display = "block";
            } else {
              trainer.style.display = "none";
            }
          }
        });
      });
    });

    allTrainers.forEach((card) => {
      const btn = card.querySelector(".btn-profile");
      const trainerNameEl = card.querySelector("h3");
      if (btn && trainerNameEl && !btn.classList.contains("btn-book")) {
        // Avoid re-adding listener
        const trainerName = trainerNameEl.textContent;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          alert(`${trainerName}님의 프로필을 봅니다.`);
        });
      }
    });
  }

  // --- START: Chat Functionality ---
  const chatFooter = document.querySelector(".chat-footer");
  if (chatFooter) {
    const chatInput = chatFooter.querySelector("input");
    const sendButton = chatFooter.querySelector("button");
    const chatBody = document.querySelector(".chat-body");

    if (chatInput && sendButton && chatBody) {
      const sendMessage = () => {
        const message = chatInput.value.trim();
        if (message !== "") {
          const newMsg = document.createElement("div");
          newMsg.classList.add("chat-msg", "sent");
          newMsg.innerHTML = `<div class="bubble">${message}</div>`;
          chatBody.appendChild(newMsg);
          chatInput.value = "";
          chatBody.scrollTop = chatBody.scrollHeight;

          // Check for the specific message and reply
          if (message === "안할래요") {
            setTimeout(() => {
              const replyMsg = document.createElement("div");
              replyMsg.classList.add("chat-msg", "received");
              replyMsg.innerHTML = `<div class="bubble">그냥 하세요.</div>`;
              chatBody.appendChild(replyMsg);
              chatBody.scrollTop = chatBody.scrollHeight;
            }, 1000); // 1-second delay
          }
        }
      };

      sendButton.addEventListener("click", sendMessage);

      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
      });
    }
  }
  // --- END: Chat Functionality ---

  const feedActions = document.querySelectorAll(".feed-actions .action-btn");
  if (feedActions.length > 0) {
    feedActions.forEach((action) => {
      action.addEventListener("click", (e) => {
        e.preventDefault();
        if (action.textContent.includes("좋아요")) {
          alert("게시글에 좋아요를 눌렀습니다.");
        } else if (action.textContent.includes("댓글")) {
          const card = action.closest(".feed-card");
          if (card) {
            const commentSection = card.querySelector(".comment-section");
            if (commentSection) {
              commentSection.style.display =
                commentSection.style.display === "none" ? "block" : "none";
            }
          }
        }
      });
    });
  }

  const moodSelectors = document.querySelectorAll(".mood-selector");
  if (moodSelectors.length > 0) {
    moodSelectors.forEach((selector) => {
      const moods = selector.querySelectorAll(".mood");
      moods.forEach((mood) => {
        mood.addEventListener("click", () => {
          moods.forEach((m) => m.classList.remove("selected"));
          mood.classList.add("selected");
        });
      });
    });

    const saveEmotionBtn = document.querySelector(".cta-button");
    if (saveEmotionBtn) {
      saveEmotionBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("오늘의 감정을 저장했습니다.");
      });
    }
  }

  const premiumBtn = document.querySelector(".cta-button");
  if (premiumBtn && premiumBtn.textContent.includes("프리미엄 시작하기")) {
    premiumBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alert("프리미엄 멤버십을 시작합니다!");
    });
  }

  // Custom Radio/Checkbox visual selection
  const radioAndCheckboxGroups = document.querySelectorAll(
    ".radio-group, .checkbox-group"
  );
  if (radioAndCheckboxGroups.length > 0) {
    radioAndCheckboxGroups.forEach((group) => {
      const inputs = group.querySelectorAll("input");
      inputs.forEach((input) => {
        input.addEventListener("change", (e) => {
          if (input.type === "radio") {
            // Remove .selected from all labels in the same group
            const labels = group.querySelectorAll("label");
            labels.forEach((label) => label.classList.remove("selected"));
            // Add .selected to the parent label of the checked radio
            if (input.checked) {
              input.parentElement.classList.add("selected");
            }
          } else if (input.type === "checkbox") {
            // Toggle .selected on the parent label of the checkbox
            input.parentElement.classList.toggle("selected", input.checked);
          }
        });
      });
    });
  }

  // Login and Signup Form Handling
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      sessionStorage.setItem("isLoggedIn", "true"); // 이 줄 추가
      alert("로그인 되었습니다! 메인 페이지로 이동합니다.");
      window.location.href = "index.html";
    });
  }

  const signupForm = document.querySelector("#signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const password = signupForm.querySelector("#password").value;
      const confirmPassword =
        signupForm.querySelector("#confirm-password").value;
      const name = signupForm.querySelector("#name").value;
      const goal = signupForm.querySelector('input[name="goal"]:checked');
      const interests = signupForm.querySelectorAll(
        'input[name="interest"]:checked'
      );

      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      let welcomeMessage = `${name}님, 회원가입을 축하합니다!`;
      if (goal) {
        welcomeMessage += `\n'${goal.parentElement.textContent.trim()}' 목표를 꼭 달성하실 수 있도록 HelpFit이 함께하겠습니다.`;
      }
      if (interests.length > 0) {
        const interestTexts = Array.from(interests).map((interest) =>
          interest.parentElement.textContent.trim()
        );
        welcomeMessage += `\n\n관심 분야인 '${interestTexts.join(
          ", "
        )}' 관련 맞춤 정보를 제공해드릴게요.`;
      }

      alert(welcomeMessage + "\n\n로그인 페이지로 이동합니다.");
      window.location.href = "login.html";
    });
  }

  // --- START: Trainer Rating Modal Logic (Refactored for multiple pages) ---
  const ratingModal = document.getElementById("rating-modal");

  if (ratingModal) {
    const modalTitle = document.getElementById("rating-trainer-name");
    const cancelRatingBtn = document.getElementById("cancel-rating");
    const submitRatingBtn = document.getElementById("submit-rating");
    const stars = ratingModal.querySelectorAll(".rating-stars span");
    if (modalTitle && cancelRatingBtn && submitRatingBtn && stars.length > 0) {
      let currentRating = 0;
      let currentTrainerName = "";

      // Function to open the modal
      const openRatingModal = (trainerName) => {
        currentTrainerName = trainerName;
        modalTitle.textContent = `${currentTrainerName} 평가하기`;
        ratingModal.style.display = "flex";
      };

      // Function to close the modal and reset state
      const closeRatingModal = () => {
        ratingModal.style.display = "none";
        currentRating = 0;
        updateStarDisplay(0); // Reset stars
      };

      // Function to update star visuals
      const updateStarDisplay = (rating) => {
        stars.forEach((star, index) => {
          if (index < rating) {
            star.classList.add("selected");
          } else {
            star.classList.remove("selected");
          }
        });
      };

      // --- Common Modal Event Listeners ---
      stars.forEach((star, index) => {
        star.addEventListener("click", () => {
          currentRating = index + 1;
          updateStarDisplay(currentRating);
        });
      });

      cancelRatingBtn.addEventListener("click", closeRatingModal);

      submitRatingBtn.addEventListener("click", () => {
        if (currentRating === 0) {
          alert("별점을 선택해주세요.");
          return;
        }
        alert(
          `${currentTrainerName}에게 ${currentRating}점의 평가를 제출했습니다!`
        );
        closeRatingModal();
      });

      // --- Trigger for Custom Trainer Page ---
      const trainerGridForRating = document.querySelector(".trainer-grid");
      if (trainerGridForRating) {
        trainerGridForRating.addEventListener("click", (e) => {
          const rateButton = e.target.closest(".btn-rate");
          if (rateButton) {
            e.preventDefault();
            const trainerCard = rateButton.closest(".trainer-card");
            const trainerName = trainerCard.querySelector("h3").textContent;
            openRatingModal(trainerName);
          }
        });
      }

      // --- Trigger for Chat Page ---
      const chatHeaderProfilePic = document.getElementById(
        "chat-trainer-profile-pic"
      );
      if (chatHeaderProfilePic) {
        chatHeaderProfilePic.addEventListener("click", () => {
          const trainerName = document.querySelector(
            ".chat-header .trainer-info h3"
          ).textContent;
          openRatingModal(trainerName);
        });
      }
    }
  }
  // --- END: Trainer Rating Modal Logic ---

  // --- START: Cheer Up Page (Feed) Logic ---
  const feedList = document.getElementById("feed-list");
  if (feedList) {
    const submitPostBtn = document.getElementById("submit-post-btn");
    const newPostContent = document.getElementById("new-post-content");

    if (submitPostBtn && newPostContent) {
      // 1. Post Creation
      submitPostBtn.addEventListener("click", () => {
        const content = newPostContent.value.trim();
        if (content === "") {
          alert("게시글 내용을 입력해주세요.");
          return;
        }

        const newCard = document.createElement("div");
        newCard.classList.add("feed-card");

        // Note: In a real app, user data would come from a session.
        // We'll use a generic user for new posts.
        newCard.innerHTML = `
                    <div class="feed-header">
                        <img src="https://images.pexels.com/photos/4753997/pexels-photo-4753997.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="User profile picture">
                        <div class="user-info">
                            <h4>박서연</h4>
                            <span>방금 전</span>
                        </div>
                    </div>
                    <div class="feed-body">
                        <p>${content}</p>
                    </div>
                    <div class="feed-actions">
                        <button class="action-btn like-btn">❤️ 좋아요 <span class="count">0</span></button>
                        <button class="action-btn comment-btn">💬 댓글 <span class="count">0</span></button>
                    </div>
                    <div class="comment-section" style="display: none;">
                        <div class="comment-list"></div>
                        <div class="comment-input-box">
                            <input type="text" placeholder="댓글을 입력하세요...">
                            <button class="submit-comment-btn">게시</button>
                        </div>
                    </div>
                `;

        feedList.prepend(newCard);
        newPostContent.value = "";
      });
    }

    // 2. Like, Comment, and Submit Comment (using Event Delegation)
    feedList.addEventListener("click", (e) => {
      const target = e.target;

      // Like button functionality
      if (target.classList.contains("like-btn")) {
        target.classList.toggle("active");
        const countSpan = target.querySelector(".count");
        if (countSpan) {
          let currentCount = parseInt(countSpan.textContent, 10);
          if (target.classList.contains("active")) {
            currentCount++;
          } else {
            currentCount--;
          }
          countSpan.textContent = currentCount;
        }
      }

      // Comment button functionality (toggle visibility)
      if (target.classList.contains("comment-btn")) {
        const card = target.closest(".feed-card");
        if (card) {
          const commentSection = card.querySelector(".comment-section");
          if (commentSection) {
            commentSection.style.display =
              commentSection.style.display === "none" ? "block" : "none";
          }
        }
      }

      // Submit comment functionality
      if (target.classList.contains("submit-comment-btn")) {
        const inputBox = target.previousElementSibling;
        if (inputBox) {
          const commentText = inputBox.value.trim();

          if (commentText === "") return;

          const commentSection = target.closest(".comment-section");
          if (commentSection) {
            const commentList = commentSection.querySelector(".comment-list");
            if (commentList) {
              const newComment = document.createElement("div");
              newComment.classList.add("comment");
              // Using a generic user name for the new comment
              newComment.innerHTML = `<p><strong>박서연:</strong> ${commentText}</p>`;
              commentList.appendChild(newComment);
              inputBox.value = "";

              // Update comment count
              const card = target.closest(".feed-card");
              if (card) {
                const commentCountSpan = card.querySelector(
                  ".comment-btn .count"
                );
                if (commentCountSpan) {
                  commentCountSpan.textContent =
                    parseInt(commentCountSpan.textContent, 10) + 1;
                }
              }
            }
          }
        }
      }
    });
  }
  // --- END: Cheer Up Page (Feed) Logic ---

  // --- START: Emotion Diary (Calendar) Page Logic ---
  const calendarContainer = document.querySelector(".calendar-container");
  if (calendarContainer) {
    const currentMonthYearEl = document.getElementById("current-month-year");
    const calendarDatesEl = document.getElementById("calendar-dates");
    const prevMonthBtn = document.getElementById("prev-month-btn");
    const nextMonthBtn = document.getElementById("next-month-btn");

    const selectedDateDisplay = document.getElementById(
      "selected-date-display"
    );
    const moodSelector = document.querySelector(".mood-selector-diary");
    const diaryTextarea = document.getElementById("diary-textarea");
    const saveDiaryBtn = document.getElementById("save-diary-btn");

    if (
      currentMonthYearEl &&
      calendarDatesEl &&
      prevMonthBtn &&
      nextMonthBtn &&
      selectedDateDisplay &&
      moodSelector &&
      diaryTextarea &&
      saveDiaryBtn
    ) {
      let currentDate = new Date();
      let selectedDate = null;
      let selectedMood = null;
      let diaryData = {
        "2025-10-03": {
          mood: "😄",
          text: "아침 조깅 30분 성공! 하루를 상쾌하게 시작했다.",
        },
        "2025-10-07": {
          mood: "😊",
          text: "필라테스 수업 다녀왔다. 몸의 정렬이 맞춰지는 느낌이 들어서 좋았다.",
        },
        "2025-10-11": {
          mood: "😕",
          text: "어깨 운동을 하는데 자세가 잘 안 나와서 조금 속상했다. 다음엔 트레이너님께 여쭤봐야지.",
        },
        "2025-10-15": {
          mood: "😐",
          text: "오늘은 휴식일. 가볍게 스트레칭만 하고 푹 쉬었다.",
        },
        "2025-10-19": {
          mood: "😄",
          text: "개인 PT 최고 기록 달성! 벤치프레스 무게를 5kg나 늘렸다. 뿌듯하다!",
        },
        "2025-10-22": {
          mood: "😊",
          text: "저녁 요가로 하루를 마무리했다. 마음이 차분해진다.",
        },
      }; // Using an object to store diary entries like a database

      const renderCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        currentMonthYearEl.textContent = `${year}년 ${month + 1}월`;
        calendarDatesEl.innerHTML = "";

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

        // Add dates from previous month
        for (let i = firstDayOfMonth; i > 0; i--) {
          const dateCell = document.createElement("div");
          dateCell.classList.add("date-cell", "other-month");
          dateCell.textContent = lastDateOfPrevMonth - i + 1;
          calendarDatesEl.appendChild(dateCell);
        }

        // Add dates for the current month
        for (let i = 1; i <= lastDateOfMonth; i++) {
          const dateCell = document.createElement("div");
          dateCell.classList.add("date-cell");
          dateCell.textContent = i;
          dateCell.dataset.date = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(i).padStart(2, "0")}`;

          const today = new Date();
          if (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            i === today.getDate()
          ) {
            dateCell.classList.add("today");
          }

          if (selectedDate && dateCell.dataset.date === selectedDate) {
            dateCell.classList.add("selected");
          }

          if (diaryData[dateCell.dataset.date]) {
            const dot = document.createElement("div");
            dot.classList.add("entry-dot");
            dateCell.appendChild(dot);
          }

          calendarDatesEl.appendChild(dateCell);
        }
      };

      const updateDiaryView = (dateStr) => {
        selectedDate = dateStr;
        const date = new Date(dateStr);
        selectedDateDisplay.textContent = `${date.getFullYear()}년 ${
          date.getMonth() + 1
        }월 ${date.getDate()}일의 일기`;

        const entry = diaryData[dateStr];
        if (entry) {
          diaryTextarea.value = entry.text;
          selectedMood = entry.mood;
        } else {
          diaryTextarea.value = "";
          selectedMood = null;
        }

        // Update mood selector visual
        moodSelector.querySelectorAll(".mood").forEach((moodEl) => {
          if (moodEl.dataset.mood === selectedMood) {
            moodEl.classList.add("selected");
          } else {
            moodEl.classList.remove("selected");
          }
        });

        renderCalendar(currentDate);
      };

      // --- Event Listeners ---
      prevMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
      });

      nextMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
      });

      calendarDatesEl.addEventListener("click", (e) => {
        const target = e.target.closest(".date-cell");
        if (target && target.dataset.date) {
          updateDiaryView(target.dataset.date);
        }
      });

      moodSelector.addEventListener("click", (e) => {
        if (e.target.classList.contains("mood")) {
          selectedMood = e.target.dataset.mood;
          moodSelector
            .querySelectorAll(".mood")
            .forEach((el) => el.classList.remove("selected"));
          e.target.classList.add("selected");
        }
      });

      saveDiaryBtn.addEventListener("click", () => {
        if (!selectedDate) {
          alert("먼저 캘린더에서 날짜를 선택해주세요.");
          return;
        }

        const text = diaryTextarea.value.trim();
        if (!selectedMood && text === "") {
          alert("기분을 선택하거나 일기 내용을 작성해주세요.");
          return;
        }

        diaryData[selectedDate] = {
          mood: selectedMood,
          text: text,
        };

        alert("일기가 저장되었습니다!");
        renderCalendar(currentDate);
      });

      // Initial Render
      renderCalendar(currentDate);
    }
  }
  // --- END: Emotion Diary (Calendar) Page Logic ---

  // --- START: Data Management (Dashboard) Page Logic ---
  const dashboardContainer = document.querySelector(".dashboard-container");
  if (dashboardContainer) {
    const periodSelector = document.querySelector(".period-selector");

    if (periodSelector) {
      // --- Mock Data ---
      const dashboardData = {
        week: {
          stats: {
            workoutTime: {
              value: "5h 30m",
              change: "+25m",
              changeType: "positive",
            },
            calories: {
              value: "2,100 kcal",
              change: "+150 kcal",
              changeType: "positive",
            },
            weight: {
              value: "74.8 kg",
              change: "-0.2 kg",
              changeType: "negative",
            },
          },
          chart: {
            title: "주간 체중 변화 (kg)",
            labels: ["월", "화", "수", "목", "금", "토", "일"],
            values: [75.0, 75.2, 75.1, 74.9, 75.0, 74.8, 74.8],
            yAxisMax: 76,
          },
        },
        month: {
          stats: {
            workoutTime: {
              value: "24h 15m",
              change: "+2h",
              changeType: "positive",
            },
            calories: {
              value: "9,800 kcal",
              change: "+500 kcal",
              changeType: "positive",
            },
            weight: {
              value: "74.8 kg",
              change: "-1.2 kg",
              changeType: "negative",
            },
          },
          chart: {
            title: "월별 체중 변화 (kg)",
            labels: ["1주", "2주", "3주", "4주"],
            values: [76.0, 75.5, 75.1, 74.8],
            yAxisMax: 77,
          },
        },
        year: {
          stats: {
            workoutTime: {
              value: "280h",
              change: "+30h",
              changeType: "positive",
            },
            calories: {
              value: "110,500 kcal",
              change: "+12,000 kcal",
              changeType: "positive",
            },
            weight: {
              value: "74.8 kg",
              change: "-5.2 kg",
              changeType: "negative",
            },
          },
          chart: {
            title: "연간 체중 변화 (kg)",
            labels: [
              "1월",
              "2월",
              "3월",
              "4월",
              "5월",
              "6월",
              "7월",
              "8월",
              "9월",
              "10월",
              "11월",
              "12월",
            ],
            values: [
              80.0, 79.5, 79.0, 78.2, 77.5, 77.0, 76.5, 76.0, 75.5, 75.0, 74.8,
              74.5,
            ],
            yAxisMax: 81,
          },
        },
      };

      const updateDashboard = (period) => {
        const data = dashboardData[period];
        if (!data) return;

        // 1. Update active button
        periodSelector.querySelectorAll(".period-btn").forEach((btn) => {
          btn.classList.toggle("active", btn.dataset.period === period);
        });

        // 2. Update stats cards
        document.getElementById("stat-workout-time").textContent =
          data.stats.workoutTime.value;
        const wtChangeEl = document.getElementById("stat-workout-time-change");
        wtChangeEl.textContent = data.stats.workoutTime.change;
        wtChangeEl.className = `stat-change ${data.stats.workoutTime.changeType}`;

        document.getElementById("stat-calories").textContent =
          data.stats.calories.value;
        const calChangeEl = document.getElementById("stat-calories-change");
        calChangeEl.textContent = data.stats.calories.change;
        calChangeEl.className = `stat-change ${data.stats.calories.changeType}`;

        document.getElementById("stat-weight").textContent =
          data.stats.weight.value;
        const wChangeEl = document.getElementById("stat-weight-change");
        wChangeEl.textContent = data.stats.weight.change;
        wChangeEl.className = `stat-change ${data.stats.weight.changeType}`;

        // 3. Update chart
        document.getElementById("chart-title").textContent = data.chart.title;
        const chartBarsEl = document.getElementById("chart-bars");
        const xAxisLabelsEl = document.getElementById("x-axis-labels");
        chartBarsEl.innerHTML = "";
        xAxisLabelsEl.innerHTML = "";

        const gridColumnCount = data.chart.values.length;
        chartBarsEl.style.gridTemplateColumns = `repeat(${gridColumnCount}, 1fr)`;
        xAxisLabelsEl.style.gridTemplateColumns = `repeat(${gridColumnCount}, 1fr)`;

        const yAxisMax = data.chart.yAxisMax;
        const yAxisMin = Math.min(...data.chart.values) - 1;

        data.chart.values.forEach((value, index) => {
          // Create bar
          const bar = document.createElement("div");
          bar.classList.add("chart-bar");
          const barHeight = ((value - yAxisMin) / (yAxisMax - yAxisMin)) * 100;
          bar.style.height = `${Math.max(barHeight, 0)}%`; // Ensure height is not negative
          bar.innerHTML = `<div class="tooltip">${value} kg</div>`;
          chartBarsEl.appendChild(bar);

          // Create label
          const label = document.createElement("div");
          label.textContent = data.chart.labels[index];
          xAxisLabelsEl.appendChild(label);
        });
      };

      // --- Event Listener ---
      periodSelector.addEventListener("click", (e) => {
        if (e.target.classList.contains("period-btn")) {
          updateDashboard(e.target.dataset.period);
        }
      });

      // --- Initial Load ---
      updateDashboard("month");
    }
  }
  // --- END: Data Management (Dashboard) Page Logic ---

  // --- START: Membership (Pricing & Payment) Page Logic ---
  const pricingGrid = document.querySelector(".pricing-grid");
  if (pricingGrid) {
    const paymentModal = document.getElementById("payment-modal");
    const paymentForm = document.getElementById("payment-form");
    const cancelPaymentBtn = document.getElementById("cancel-payment-btn");
    const selectedPlanNameEl = document.getElementById("selected-plan-name");

    if (paymentModal && paymentForm && cancelPaymentBtn && selectedPlanNameEl) {
      // Open modal when a plan is selected
      pricingGrid.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-select-plan")) {
          const planCard = e.target.closest(".plan-card");
          const planName = planCard.querySelector(".plan-title").textContent;

          selectedPlanNameEl.textContent = planName;
          paymentModal.style.display = "flex";
        }
      });

      // Close modal on cancel
      cancelPaymentBtn.addEventListener("click", () => {
        paymentModal.style.display = "none";
      });

      // Handle payment submission
      paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Basic validation
        const cardNumber = document.getElementById("card-number").value;
        const expiryDate = document.getElementById("expiry-date").value;
        const cvc = document.getElementById("cvc").value;
        const cardName = document.getElementById("card-name").value;

        if (!cardNumber || !expiryDate || !cvc || !cardName) {
          alert("모든 카드 정보를 입력해주세요.");
          return;
        }

        // Simulate payment processing
        const paymentBtn = document.getElementById("submit-payment-btn");
        paymentBtn.textContent = "결제 처리 중...";
        paymentBtn.disabled = true;

        setTimeout(() => {
          alert(
            "결제가 성공적으로 완료되었습니다! HelpFit 프리미엄에 오신 것을 환영합니다."
          );

          // Reset form and close modal
          paymentForm.reset();
          paymentBtn.textContent = "결제 완료";
          paymentBtn.disabled = false;
          paymentModal.style.display = "none";
        }, 2000);
      });
    }
  }
  // --- END: Membership (Pricing & Payment) Page Logic ---

  // --- START: Sidebar (My Page) Logic ---
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const sidebar = document.getElementById("sidebar");
  const closeSidebarBtn = document.getElementById("close-sidebar-btn");
  const overlay = document.getElementById("overlay");

  if (hamburgerMenu && sidebar && closeSidebarBtn && overlay) {
    const toggleSidebar = () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("active");
    };

    hamburgerMenu.addEventListener("click", toggleSidebar);

    closeSidebarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSidebar();
    });

    overlay.addEventListener("click", toggleSidebar);
  }
  // --- END: Sidebar (My Page) Logic ---

  // --- START: Sidebar Actions & Forms Logic ---
  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem("isLoggedIn"); // 이 줄 추가
      alert("로그아웃 되었습니다.");
      window.location.href = "login.html";
    });
  }

  // Edit Profile form functionality
  const editProfileForm = document.getElementById("edit-profile-form");
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById("current-password").value;
      if (currentPassword === "") {
        alert("정보를 수정하려면 현재 비밀번호를 입력해야 합니다.");
        return;
      }
      // This is a simulation. In a real app, you'd verify the password.
      alert("개인정보가 성공적으로 수정되었습니다.");
    });
  }
  // --- END: Sidebar Actions & Forms Logic ---
});

// 스텝업 영상 재생 버튼
document
  .querySelector(".pt-video-card button:first-child")
  .addEventListener("click", function () {
    // 유튜브 영상 코드 가져오기
    const card = this.closest(".pt-video-card");
    const youtubeCode = card.getAttribute("data-video");

    // 영상 띄우기
    showYoutubeVideo(youtubeCode);
  });

function showYoutubeVideo(code) {
  // 검은 배경 만들기
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "0";
  popup.style.left = "0";
  popup.style.width = "100%";
  popup.style.height = "100%";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
  popup.style.zIndex = "99999";
  popup.style.display = "flex";
  popup.style.justifyContent = "center";
  popup.style.alignItems = "center";

  // 닫기 버튼과 유튜브 영상
  popup.innerHTML = `
    <button style="position: absolute; top: 20px; right: 30px; font-size: 50px; color: white; background: none; border: none; cursor: pointer;">×</button>
    <iframe width="90%" height="80%" style="max-width: 1000px; border-radius: 10px;" 
            src="https://www.youtube.com/embed/${code}?autoplay=1" 
            frameborder="0" allowfullscreen></iframe>
  `;

  document.body.appendChild(popup);

  // X 버튼 누르면 닫기
  popup.querySelector("button").onclick = function () {
    popup.remove();
  };

  // 배경 누르면 닫기
  popup.onclick = function (e) {
    if (e.target === popup) {
      popup.remove();
    }
  };
}
