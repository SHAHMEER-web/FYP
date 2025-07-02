const chatbotIcon = document.getElementById("chatbotIcon");
const chatbotContainer = document.getElementById("chatbotContainer");
const chatbotBody = document.getElementById("chatbotBody");
const userInput = document.getElementById("userInput");
const sendButton = document.querySelector(".send-button");

// Popup for irrelevant questions limit (styled as an error message)
const popup = document.createElement("div");
popup.className = "popup";
popup.style.display = "none";
popup.style.position = "fixed";
popup.style.top = "50%";
popup.style.left = "50%";
popup.style.transform = "translate(-50%, -50%)";
popup.style.backgroundColor = "#f8d7da";
popup.style.color = "#721c24";
popup.style.border = "1px solid #f5c6cb";
popup.style.borderRadius = "5px";
popup.style.padding = "20px";
popup.style.zIndex = "1000";
popup.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

// Popup content
popup.innerHTML = `
    <div class="popup-content">
        <h3 style="font-size: 18px; font-weight: bold;">Error: You've reached the maximum number of irrelevant questions!</h3>
        <p>Please refresh the page and ask relevant questions about Hamdard University.</p>
        <button id="closePopup" style="background-color: #f5c6cb; color: #721c24; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            Close
        </button>
    </div>
`;
document.body.appendChild(popup);

// Toggle chatbot visibility
chatbotIcon.addEventListener("click", () => {
    chatbotContainer.style.display =
        chatbotContainer.style.display === "none" || chatbotContainer.style.display === ""
            ? "block"
            : "none";
});

function appendMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "user" ? "user-message" : "bot-message";
    messageDiv.textContent = message;
    chatbotBody.appendChild(messageDiv);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

// TF-IDF Similarity implementation
function tfidf(text) {
    const terms = text.toLowerCase().split(/\s+/);
    const termFreq = {};
    terms.forEach((term) => {
        termFreq[term] = (termFreq[term] || 0) + 1;
    });
    return termFreq;
}

function cosineSimilarity(vec1, vec2) {
    const allTerms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    allTerms.forEach((term) => {
        const val1 = vec1[term] || 0;
        const val2 = vec2[term] || 0;
        dotProduct += val1 * val2;
        magnitude1 += val1 * val1;
        magnitude2 += val2 * val2;
    });

    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}


// Predefined knowledge base
const knowledgeBase = [
    {
        question: "Hi , hello",
        answer: "Hi,what can I tell you about Hamdard University?",
    },
    {
        question: "Hi , hello",
        answer: "Hi, how can I help you?",
    },
    {
        question: "hi, how are you?, hi, how are you, how are you",
        answer: "I am fine, thank you. Kindly ask anything about Hamdard University onl.",
    },
    {
        question: "Where is Hamdard University?",
        answer: "Hamdard University is located in Karachi, having several campuses.",
    },
    {
        question: "Where is the city campus of Hamdard University?",
        answer: "City Campus of Hamdard University is located near Jail Chowrangi.",
    },
    {
        question: "How many campuses does Hamdard University have?",
        answer: "Hamdard University has multiple campuses, including the Main Campus in Karachi, City Campus (PECHS), North Nazimabad KDA Campus, Bahadurabad Campus, and campuses in Islamabad and Faisalabad."
    },
    {
        question: "Where is the main campus of Hamdard University located?",
        answer: "The main campus of Hamdard University is located on Madinat al-Hikmah, Hakim Mohammad Said Road, Karachi, Sindh, Pakistan."
    },
    {
        question: "What are the addresses of all Hamdard University campuses?",
        answer: "The addresses are as follows:\n- Main Campus: Madinat al-Hikmah, Hakim Mohammad Said Road, Karachi.\n- City Campus (PECHS): PECHS Block 6, Karachi.\n- North Nazimabad KDA Campus: KDA Scheme 1, North Nazimabad, Karachi.\n- Bahadurabad Campus: Bahadurabad Chowrangi, Karachi.\n- Islamabad Campus: Plot #9, Shakarparian Road, Islamabad.\n- Faisalabad Campus: East Canal Road, Faisalabad."
    },
    {
        question: "Does Hamdard University provide transport facilities for students?",
        answer: "Yes, Hamdard University offers transport facilities for students, including shuttle services to various campuses such as Main Campus, North Nazimabad KDA Campus, and Bahadurabad Campus."
    },
    {
        question: "Can I take admission with 45% percentage? Can I take admission with 45% percentage",
        answer: "The minimum requirement to get admission in BS, program is 50% marks."
    },
    {
        question: "Is transport facility available for students?",
        answer: "Yes, Hamdard University offers transport facilities for students, including shuttle services to various campuses such as Main Campus, North Nazimabad KDA Campus, and Bahadurabad Campus."
    },
    {
        question: "Are hostel facilities available at Hamdard University?",
        answer: "Yes, the university provides separate hostel facilities for male and female students at the main campus in Karachi."
    },
    {
        question: "Does Hamdard University have medical facilities for students?",
        answer: "Yes, Hamdard University provides on-campus medical facilities to cater to the health needs of students and staff."
    },
    {
        question: "What programs does Hamdard University offer?",
        answer:
            "Hamdard University offers undergraduate, graduate, and doctoral programs in various disciplines such as computer science, business administration, engineering, health sciences, and more.",
    },
    {
        question: "How do I apply for admission to Hamdard University?",
        answer:
            "Admissions can be done online through the university's official website or by visiting the admissions office. Detailed instructions are provided on the website, including application deadlines and requirements.",
    },
    {
        question:
            "What are the eligibility criteria for undergraduate programs?",
        answer:
            "Students must have completed their Higher Secondary School Certificate (HSSC) or equivalent with a minimum percentage as specified by the program requirements.",
    },
    {
        question: "What is the fee structure for Hamdard University?",
        answer:
            "The fee structure varies by program. It is available on the university’s admissions page or can be obtained directly from the admissions office.",
    },
    {
        question:
            "Are there any scholarships available at Hamdard University?",
        answer:
            "Yes, Hamdard University offers merit-based scholarships, financial aid, and other assistance programs. Students can check the scholarship page on the website for more details.",
    },
    {
        question: "How do I contact the university for further inquiries?",
        answer:
            "You can contact the university through the contact details available on the university’s website or visit the campus during office hours.",
    },
    {
        question: "What programs are offered by the Department of Computing?",
        answer:
            "The Department of Computing offers programs in Computer Science, Software Engineering, Artificial Intelligence, and related fields at both undergraduate and graduate levels.",
    },
    {
        question:
            "What is the admission process for the Department of Computing?",
        answer:
            "Students must follow the general admission process outlined by the university, including submission of required documents and meeting the specific eligibility criteria for the computing programs.",
    },
    {
        question:
            "What career opportunities are available after completing a degree from the Department of Computing?",
        answer:
            "Graduates of the Department of Computing have opportunities in software development, data science, AI research, cybersecurity, IT consulting, and many more fields in the tech industry.",
    },
    {
        question:
            "Are there any industry collaborations or internships available?",
        answer:
            "The department often collaborates with industry leaders to provide internships, workshops, and career placement services for students.",
    },
    {
        question:
            "What are the research areas in the Department of Computing?",
        answer:
            "The department focuses on a variety of research areas including AI, machine learning, data science, software engineering, and computer networks.",
    },

    {
        question: "What programs does Hamdard University offer?",
        answer:
            "Hamdard University offers undergraduate, graduate, and doctoral programs in various disciplines such as computer science, business administration, engineering, health sciences, and more.",
    },
    {
        question: "How do I apply for admission to Hamdard University?",
        answer:
            "Admissions can be done online through the university's official website or by visiting the admissions office. Detailed instructions are provided on the website, including application deadlines and requirements.",
    },
    {
        question:
            "What are the eligibility criteria for undergraduate programs?",
        answer:
            "Students must have completed their Higher Secondary School Certificate (HSSC) or equivalent with a minimum percentage as specified by the program requirements.",
    },
    {
        question: "What is the fee structure for Hamdard University?",
        answer:
            "The fee structure varies by program. It is available on the university’s admissions page or can be obtained directly from the admissions office.",
    },
    {
        question:
            "Are there any scholarships available at Hamdard University?",
        answer:
            "Yes, Hamdard University offers merit-based scholarships, financial aid, and other assistance programs. Students can check the scholarship page on the website for more details.",
    },
    {
        question: "How do I contact the university for further inquiries?",
        answer:
            "You can contact the university through the contact details available on the university’s website or visit the campus during office hours.",
    },
    {
        question: "What programs are offered by the Department of Computing?",
        answer:
            "The Department of Computing offers programs in Computer Science, Software Engineering, Artificial Intelligence, and related fields at both undergraduate and graduate levels.",
    },
    {
        question:
            "What is the admission process for the Department of Computing?",
        answer:
            "Students must follow the general admission process outlined by the university, including submission of required documents and meeting the specific eligibility criteria for the computing programs.",
    },
    {
        question:
            "What career opportunities are available after completing a degree from the Department of Computing?",
        answer:
            "Graduates of the Department of Computing have opportunities in software development, data science, AI research, cybersecurity, IT consulting, and many more fields in the tech industry.",
    },
    {
        question:
            "Are there any industry collaborations or internships available?",
        answer:
            "The department often collaborates with industry leaders to provide internships, workshops, and career placement services for students.",
    },
    {
        question:
            "What are the research areas in the Department of Computing?",
        answer:
            "The department focuses on a variety of research areas including AI, machine learning, data science, software engineering, and computer networks.",
    },

    {
        question:
            "Is there any student club or society related to computing?",
        answer:
            "The department may have student-led clubs such as the Computer Science Society, offering students opportunities to participate in coding challenges, hackathons, and other technical events.",
    },
    {
        question: "How can I get in touch with my academic advisor?",
        answer:
            "You can contact your academic advisor through the department’s faculty page or by visiting the department office during office hours.",
    },
    {
        question:
            "Are there any specific requirements or prerequisites for advanced courses?",
        answer:
            "Advanced courses may have specific prerequisites, such as prior completion of foundational courses in programming, mathematics, or related subjects. Check the course catalog for more details.",
    },
    {
        question: "How can I apply to Hamdard University?",
        answer:
            "You can apply online through the Hamdard University admissions portal. All details regarding application procedures, deadlines, and requirements are listed on the official website.",
    },
    {
        question: "What programs does Hamdard University offer?",
        answer:
            "Hamdard University offers undergraduate, graduate, and doctoral programs in various fields, including health sciences, business, social sciences, engineering, and computer science.",
    },
    {
        question: "What are the admission requirements?",
        answer:
            "Admission requirements depend on the program. Generally, they include academic transcripts, a valid entrance test score (if required), and a completed application form.",
    },
    {
        question: "Is financial aid available?",
        answer:
            "Yes, Hamdard University offers scholarships, financial assistance, and student loans to eligible students. Details can be found on the admissions page.",
    },
    {
        question: "What is the university’s fee structure?",
        answer:
            "The fee structure varies by program. The latest fee details can be found on the official website under the fee section.",
    },
    {
        question: "What are the hostel facilities like?",
        answer:
            "Hamdard University provides hostel accommodation for both male and female students with all basic amenities.",
    },
    {
        question: "What extracurricular activities are available?",
        answer:
            "The university encourages students to participate in various extracurricular activities, including sports, cultural events, and societies.",
    },
    {
        question: "What programs are offered by the Department of Computing?",
        answer:
            "The Department of Computing offers programs in Computer Science, Software Engineering, and Artificial Intelligence at undergraduate and graduate levels.",
    },

    {
        question:
            "What is the admission process for the Department of Computing?",
        answer:
            "The admission process is the same as for other departments. Applicants must meet the academic eligibility criteria, which are program-specific, and pass the entrance test if required.",
    },
    {
        question: "Is there a specific entrance exam for Computing programs?",
        answer:
            "Yes, depending on the program, there may be an entrance exam or interview.",
    },
    {
        question: "Are there any industry collaborations or internships?",
        answer:
            "Yes, the Department of Computing has partnerships with various IT companies, and students are encouraged to take internships to gain hands-on experience in the field.",
    },
    {
        question: "What career support is available for Computing students?",
        answer:
            "The department provides career counseling, job placement assistance, and helps students connect with industry professionals.",
    },
    {
        question: "Can I get a PhD in Computing from Hamdard University?",
        answer:
            "Yes, Hamdard University offers doctoral programs in computing-related fields, depending on the research interests of faculty members.",
    },
    {
        question:
            "What labs and facilities are available for Computing students?",
        answer:
            "The Department of Computing is equipped with state-of-the-art computer labs, research facilities, and access to various software and tools used in the industry.",
    },
    {
        question: "What is the curriculum structure?",
        answer:
            "The curriculum is designed to provide both theoretical knowledge and practical skills, focusing on the latest advancements in computing technologies, programming languages, algorithms, AI, and more.",
    },
    {
        question: "How can I contact the Department of Computing?",
        answer:
            "You can contact the department via the official Hamdard University website or directly through the Department’s contact details listed on the page.",
    },
    {
        question: "How can I apply for admission at Hamdard University?",
        answer:
            "You can apply online through the university’s official website or by visiting the admissions office. The application form will require personal details, academic history, and the required documents.",
    },
    {
        question: "What is the eligibility criteria for different programs?",
        answer:
            "Eligibility criteria vary by program. Generally, for undergraduate programs, students need to have completed their intermediate (FSc or equivalent) with a minimum percentage (usually 50-60%). For graduate programs, a relevant undergraduate degree is required with a minimum CGPA or percentage.",
    },
    {
        question: "What is the admission deadline for the upcoming semester?",
        answer:
            "Admission deadlines are usually announced on the university website or through advertisement in local newspapers. You should check the university’s admissions page for the most current dates.",
    },
    {
        question: "How can I check the status of my application?",
        answer:
            "You can check the status of your application by logging into the online admissions portal with your credentials or by contacting the admissions office directly.",
    },
    {
        question:
            "What are the tuition fees for undergraduate and graduate programs?",
        answer:
            "Tuition fees vary by program. Undergraduate fees generally range from PKR 30,000 to PKR 60,000 per semester, while graduate programs can be higher. Check the official website for the specific fee structure for your program of interest.",
    },
    {
        question:
            "Does Hamdard University offer financial aid or scholarships?",
        answer:
            "Yes, Hamdard University offers financial aid and scholarships based on merit and need. You can apply for scholarships at the time of admission or during your studies. Details are available on the university's financial aid page.",
    },
    {
        question: "What is the process for hostel accommodation?",
        answer:
            "Hostel accommodation is available on a first-come, first-served basis. To apply for a hostel, you need to fill out a hostel application form and submit it to the student affairs office. You may also need to pay an advance fee for accommodation.",
    },
    {
        question:
            "Are there part-time job opportunities available for students?",
        answer:
            "Hamdard University offers part-time job opportunities in various departments such as library, administration, and research. You can inquire at the student affairs office for available opportunities.",
    },
    {
        question:
            "What facilities are available on campus (e.g., library, sports, cafeteria)?",
        answer:
            "The university campus has a modern library, computer labs, sports facilities, a cafeteria, and Wi-Fi access. You can find more information about specific facilities on the campus tour or on the university’s website.",
    },
    {
        question: "How can I get in touch with faculty or department heads?",
        answer:
            "Faculty contact details are usually available on the respective department’s webpage on the university’s website. You can also email or call the department’s office for assistance.",
    },
    {
        question:
            "What is the process to request transcripts or certificates?",
        answer:
            "To request transcripts or certificates, you need to fill out a request form available on the student portal or at the registrar's office. There may be a processing fee, and transcripts can be sent directly to other institutions upon request.",
    },
    {
        question: "Where can I find the academic calendar?",
        answer:
            "The academic calendar is typically available on the university’s website under the 'Academic' or 'Student Affairs' section. It provides important dates such as semester start/end dates, holidays, and exam schedules.",
    },
    {
        question: "What is the application process?",
        answer:
            "After submitting the application, you’ll receive an email and text notification. The application processing fee is Rs. 1500, except for the Faculty of Engineering Science and Technology. Payments can be made through UBL branches after printing the payment voucher.",
    },
    {
        question: "What is the process for the aptitude test?",
        answer:
            "If you have high SAT or GMAT scores, you may be exempt from the Hamdard University entrance exam, but an interview is still required.",
    },
    {
        question:
            "Are scholarships and financial aid available for all programs?",
        answer:
            "Hamdard offers merit-based scholarships and financial assistance, except for subsidized programs.",
    },
    {
        question: "Where are Hamdard University's campuses located?",
        answer:
            "Besides the main campus, Hamdard has several campuses in Karachi and Islamabad.",
    },
    {
        question: "What programs does Hamdard University offer?",
        answer: "Hamdard University offers undergraduate, graduate, and doctoral programs in various disciplines such as computer science, business administration, engineering, health sciences, and more."
    },
    {
        question: "How do I apply for admission to Hamdard University?",
        answer: "Admissions can be done online through the university's official website or by visiting the admissions office. Detailed instructions are provided on the website, including application deadlines and requirements."
    },

    {
        question: "Who are the faculty members of Hamdard University?",
        answer: "Hamdard University has a diverse and highly qualified faculty across all departments. You can find a list of faculty members on the official university website under the respective department pages."
    },
    {
        question: "How can I contact a faculty member?",
        answer: "Faculty contact details are available on the Hamdard University website. You can visit the department's webpage or contact the university's administration office for more information."
    },
    {
        question: "What qualifications do the teachers at Hamdard University have?",
        answer: "The faculty members at Hamdard University hold advanced degrees such as M.S., M.Phil., and Ph.D. from reputed national and international institutions. They have expertise in their respective fields."
    },
    {
        question: "Can I schedule a meeting with a faculty member?",
        answer: "Yes, you can schedule a meeting with your faculty member by contacting them through email or visiting their office during office hours. Check the department's page for specific contact details and office hours."
    },
    {
        question: "Are the faculty members involved in research?",
        answer: "Yes, many faculty members at Hamdard University are actively involved in research across various fields. They publish in reputable journals and participate in conferences and seminars."
    },
    {
        question: "How can I know about the faculty’s research interests?",
        answer: "Faculty research interests are typically listed on the department’s webpage. You can also check individual faculty profiles for their areas of research and recent publications."
    },
    {
        question: "Do the faculty members offer mentorship?",
        answer: "Yes, faculty members at Hamdard University often provide mentorship to students, guiding them in academic, research, and career-related matters."
    },
    {
        question: "Can I contact my professor if I have academic concerns?",
        answer: "Absolutely! If you have academic concerns, you can contact your professor directly via email or schedule an appointment during office hours."
    },
    {
        question: "What is the student-to-faculty ratio at Hamdard University?",
        answer: "The student-to-faculty ratio varies by department, but Hamdard University strives to maintain a low ratio to ensure personalized attention and support for students."
    },
    {
        question: "Are there any teaching assistants in the classes?",
        answer: "Yes, in some courses, especially at the graduate level, teaching assistants may be available to assist professors with coursework, grading, and research."
    },
    {
        question: "Do faculty members at Hamdard University have international teaching experience?",
        answer: "Yes, several faculty members have international teaching experience and have studied or taught at universities abroad, bringing diverse perspectives to the classroom."
    },
    {
        question: "How do I know which faculty members are teaching my course?",
        answer: "You can find out which faculty member is teaching your course by checking the course schedule or syllabus, which is usually available on the university's website or through the department office."
    },
    {
        question: "Can I take a course with a specific faculty member?",
        answer: "You can choose courses based on the professor’s name or their teaching style if it’s available in the course catalog. However, course availability depends on the semester schedule and departmental requirements."
    },
    {
        question: "What is the process to apply for a faculty position at Hamdard University?",
        answer: "If you’re interested in applying for a faculty position, you can check the careers section on Hamdard University's website for open positions and application instructions."
    },
    {
        question: "How are faculty members evaluated at Hamdard University?",
        answer: "Faculty members are evaluated based on their teaching effectiveness, research contributions, student feedback, and participation in university activities. Regular evaluations ensure high standards of education."
    },
    {
        question: "What qualifications do the faculty members at Hamdard University have?",
        answer: "Faculty members at Hamdard University hold advanced degrees, such as Master's, M.Phil., and Ph.D., from renowned national and international universities. They are experts in their respective fields, with many having completed their studies from prestigious institutions around the world."
    },
    {
        question: "Do faculty members have international education?",
        answer: "Yes, many faculty members at Hamdard University have pursued their higher education abroad, obtaining degrees from top universities in countries like the USA, UK, Canada, and other parts of Europe and Asia."
    },
    {
        question: "What is the experience level of the faculty at Hamdard University?",
        answer: "The faculty at Hamdard University has a wide range of experience, with many having decades of teaching and research experience. Some faculty members also have industry experience and have worked with top companies and organizations before joining the university."
    },
    {
        question: "Do the professors at Hamdard University have any research experience?",
        answer: "Yes, the professors at Hamdard University are actively involved in research. Many have published in leading academic journals and have participated in international conferences. They often work on cutting-edge research projects in their fields of expertise."
    },
    {
        question: "Are the faculty members at Hamdard University involved in any professional development?",
        answer: "Yes, faculty members at Hamdard University continuously engage in professional development activities. They attend workshops, seminars, and training sessions to stay updated on the latest trends in education, technology, and research methodologies."
    },
    {
        question: "Can faculty members at Hamdard University teach in multiple departments?",
        answer: "Some faculty members with expertise in interdisciplinary fields may teach courses across multiple departments. However, most faculty specialize in a particular field or department, contributing their in-depth knowledge and experience."
    },
    {
        question: "What teaching experience do the faculty members at Hamdard University have?",
        answer: "Faculty members at Hamdard University have substantial teaching experience, with many having taught at other universities or educational institutions before joining Hamdard. They bring years of teaching expertise to their courses, ensuring high-quality education for students."
    },
    {
        question: "Are the faculty members at Hamdard University involved in any consulting work?",
        answer: "Yes, many faculty members are involved in consulting work with various industries, government organizations, and NGOs. Their practical experience helps bridge the gap between academia and the professional world."
    },
    {
        question: "How do the faculty members stay updated with advancements in their field?",
        answer: "Faculty members regularly engage in professional development through workshops, conferences, research collaborations, and publications. They also participate in academic networks and stay updated on the latest developments in their areas of expertise."
    },
    {
        question: "Do faculty members at Hamdard University have any experience in teaching at the graduate level?",
        answer: "Yes, many faculty members at Hamdard University have extensive experience in teaching graduate-level courses, including Master's and Ph.D. programs. They guide students in advanced research and academic work, contributing to their academic and professional growth."
    },
    {
        question: "What kind of industry experience do the faculty members at Hamdard University have?",
        answer: "Several faculty members have worked in industry and the corporate sector before joining academia. Their real-world experience enriches their teaching, offering students practical insights into the professional world."
    },
    {
        question: "Are the faculty members at Hamdard University involved in any academic collaborations?",
        answer: "Yes, faculty members frequently collaborate with academic institutions, research organizations, and industry partners both locally and internationally. These collaborations help foster innovation and contribute to the academic community."
    },
    {
        question: "How do the faculty members’ experiences benefit students?",
        answer: "The faculty members' diverse educational backgrounds and industry experience provide students with a well-rounded perspective. Students gain not only theoretical knowledge but also practical insights from faculty who are experts in their fields."
    },
    {
        question: "Do the faculty members have any involvement in community service?",
        answer: "Yes, many faculty members are involved in community service, whether through social initiatives, outreach programs, or research aimed at solving real-world problems. They contribute their expertise to various causes and societal needs."
    },
    {
        question: "How long have the faculty members been teaching at Hamdard University?",
        answer: "The tenure of faculty members at Hamdard University varies, with many having been part of the university for several years, while others may have recently joined. The university attracts highly qualified professionals with diverse backgrounds."
    },


    // Add more questions and answers here
];

// List of unnecessary questions
const unnecessaryQuestions = [
    "Why are you so rude?",
    "Do you have a girlfriend?",
    "Can you tell me a joke?",
    "Are you a human or a robot?",
    "What is your favorite color?",
    "Why don’t you have emotions?",
    "Can you date me?",
    "Do you like pizza?",
    "Why do you always answer the same way?",
    "Are you a boy or a girl?",
    "Do you believe in love?",
    "What’s your opinion on relationships?",
    "Can you help me get a girlfriend?",
    "Are you single?",
    "Why don’t you ever laugh?",
    "Can you talk about something other than university?",
    "What’s your favorite hobby?",
    "Why do you always sound so serious?",
    "Can you tell me how to get rich fast?",
    "What’s your opinion on fashion?",
    "What's the weather like?",
    "Tell me a joke",
    "What is your name?",
    "How old are you?",
    "Where are you from?",
    "What's your favorite color?",
    "Do you like pizza?",
    "Can you tell me a joke?",
    "What time is it?",
    "How's the weather today?",
    "What's the capital of Mars?",
    "What’s your opinion on movies?",
    "Do you have a pet?",
    "What's your favorite music genre?",
    "Can you help me find a restaurant nearby?",
    "Are you human or a robot?",
    "What's your name?",
    "Can you dance?",
    "Do you believe in aliens?",
    "How old are you?",
    "Where do you live?",
    "What’s your favorite book?",
    "Can you sing a song?",
    "What's your favorite holiday?",
    "How do you feel today?",
    "Can you recommend a good movie to watch?",
    "What’s the best way to make friends?",
    "How can I get more followers on Instagram?",
    "What’s the latest trend on TikTok?",
    "Do you think aliens exist?",
    "Can you give me advice on how to study better?",
    "How do I make a YouTube video?",
    "Can you tell me a funny story?",
    "Do you believe in ghosts?",
    "How can I improve my gaming skills?",
    "What’s the meaning of life?",
    "How can I get rich quickly?",
    "What’s the best social media platform?",
    "What are your thoughts on video games?",
    "How do I make the perfect cup of coffee?",
    "What’s your opinion on the latest celebrity gossip?",
    "Can you suggest a good playlist for studying?",
    "What’s your favorite meme?",
    "What’s the best way to relax after exams?",
    "How do I deal with stress during exams?",
];

// Limiting the number of messages for unnecessary questions
let messageCount = 0;
const maxMessages = 2;

// Get best match for the user's query
function getBestMatch(userQuery) {
    const userQueryLower = userQuery.toLowerCase();

    // Check if the query matches any unnecessary question
    if (unnecessaryQuestions.some(q => userQueryLower.includes(q.toLowerCase()))) {
        if (messageCount >= maxMessages) {
            userInput.style.display = "none";
            sendButton.style.display = "none";
            popup.style.display = "block";
            return "";
        } else {
            messageCount++;
            return "Please ask about Hamdard University.";
        }
    }

    // If the question is about Hamdard University, no limit applies
    const userQueryVector = tfidf(userQuery);
    let bestMatch = null;
    let highestSimilarity = 0;

    knowledgeBase.forEach((item) => {
        const questionVector = tfidf(item.question);
        const similarity = cosineSimilarity(userQueryVector, questionVector);

        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = item;
        }
    });

    return bestMatch
        ? bestMatch.answer
        : "I'm sorry, I couldn't find an answer to your question. Could you please rephrase it?";
}

// Send message to chatbot
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("user", message);
    userInput.value = "";

    const response = getBestMatch(message);
    if (response) {
        appendMessage("bot", response);
    }
}

// Close popup and refresh page
document.getElementById("closePopup").addEventListener("click", () => {
    location.reload();
});

// Close chatbot if clicking outside of it
document.addEventListener("click", (event) => {
    if (!chatbotContainer.contains(event.target) && event.target !== chatbotIcon) {
        chatbotContainer.style.display = "none";
    }
});

// Send message on Enter key press
userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const userMessage = event.target.value.trim();
        if (userMessage) {
            appendMessage("user", userMessage);

            const botReply = getBestMatch(userMessage);
            if (botReply) {
                appendMessage("bot", botReply);
            }

            event.target.value = "";
        }
    }
});






// Predefined credentials for HOD, Coordinator, and Super Admin
const users = {
    HOD: {
        id: "12345",
        password: "hod123"
    },
    Coordinator: {
        id: "67890",
        password: "coord123"
    },
    SuperAdmin: {
        id: "2278",
        password: "superadmin"
    }
};

// Check if the user is already logged in
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const loginTime = sessionStorage.getItem("loginTime");
    const currentTime = Date.now();

    // Redirect to login if not logged in or session expired (10 seconds timeout)
    if (!isLoggedIn || !loginTime || currentTime - loginTime > 10000) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("loginTime");
        sessionStorage.removeItem("role");
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
    }
}

// Call the function to enforce login check on page load
if (window.location.pathname.includes("admin.html")) {
    checkLoginStatus();
}

// Handle login form submission
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent form submission

            const id = document.getElementById("signin-id").value.trim();
            const password = document.getElementById("signin-password").value.trim();
            const errorMessage = document.getElementById("errorMessage");

            // Validate credentials
            if (
                (id === users.HOD.id && password === users.HOD.password) ||
                (id === users.Coordinator.id && password === users.Coordinator.password) ||
                (id === users.SuperAdmin.id && password === users.SuperAdmin.password)
            ) {
                // Store login status and role in sessionStorage
                let role = "";
                if (id === users.HOD.id) role = "HOD";
                if (id === users.Coordinator.id) role = "Coordinator";
                if (id === users.SuperAdmin.id) role = "SuperAdmin";

                sessionStorage.setItem("isLoggedIn", true);
                sessionStorage.setItem("role", role);

                // Redirect based on role
                if (role === "SuperAdmin") {
                    window.location.href = "Admin panels/super_admin.html";
                } else {
                    window.location.href = "Admin panels/admin.html";
                }
            } else {
                // Show error message
                if (errorMessage) {
                    errorMessage.textContent = "Invalid ID or Password!";
                    errorMessage.classList.remove("d-none");
                } else {
                    alert("Invalid ID or Password!"); // Fallback error message
                }
            }
        });
    }
});

// Reset session if navigating back to login.html after 10 seconds
if (window.location.pathname.includes("login.html")) {
    const loginTime = sessionStorage.getItem("loginTime");
    const currentTime = Date.now();

    if (loginTime && currentTime - loginTime > 3000) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("loginTime");
        sessionStorage.removeItem("role");
        alert("Session expired. Please log in again.");
    }
}




// =================================================== HOD Message ==================================================
// DOM Element
const adminContent = document.getElementById("adminContent");

// Function to load and display data from localStorage
const displayData = () => {
    let savedContent = JSON.parse(localStorage.getItem("dynamicContent")) || [];

    adminContent.innerHTML = ""; // Clear current content

    if (savedContent.length === 0) {
        adminContent.innerHTML = "<p class='text-muted text-center'>No data available.</p>";
        return;
    }

    savedContent.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card my-3 p-3 shadow-sm";

        card.innerHTML = `
                        <div class="d-flex align-items-start">
                            <div class="content-container">
                                <h4>${item.title}</h4>
                                    <p style="text-align: justify;">${item.description}</p>
                                        <p class="fw-bold">${item.author}</p>
                            </div>
                            <div class="image-container ms-3">
                                <img src="${item.image}" alt="Uploaded Image" class="rounded img-fluid">
                            </div>
                        </div> `;

        adminContent.appendChild(card);
    });
};

// Initialize content on page load
document.addEventListener("DOMContentLoaded", displayData);




// =============================================== Announcments & News ==================================================



document.addEventListener("DOMContentLoaded", function () {
    showAnnouncement();
    updateBanner(); // Ensure banner updates when loaded
});

// Function to show the announcement
function showAnnouncement() {
    const overlay = document.getElementById('announcementOverlay');
    const modal = overlay.querySelector('.announcement-modal');

    overlay.classList.add('show');
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

// Function to close the announcement
function closeAnnouncement() {
    const overlay = document.getElementById('announcementOverlay');
    const modal = overlay.querySelector('.announcement-modal');

    modal.classList.remove('show');
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 300);
}

// Function to update banner content
function updateBanner() {
    const bannerContent = document.getElementById('announcementText');
    const items = JSON.parse(localStorage.getItem('scrollItems')) || [];
    bannerContent.innerHTML = items.length ? items.map(item => `<p>${item}</p>`).join('') : "<p>No announcements</p>";
}

// Update banner when clicking outside
document.getElementById('announcementOverlay').addEventListener('click', function (event) {
    if (event.target === this) {
        closeAnnouncement();
    }
});

// ================================================== Coordinators Images ================================================


document.addEventListener("DOMContentLoaded", function () {
    const coordinatorsContainer = document.getElementById("coordinatorsContainer");

    function getCoordinators() {
        return JSON.parse(localStorage.getItem("coordinators")) || [];
    }

    function renderCoordinators() {
        coordinatorsContainer.innerHTML = "";
        const coordinators = getCoordinators();

        coordinators.forEach((coordinator) => {
            const col = document.createElement("div");
            col.classList.add("col-lg-4", "col-md-6", "col-sm-12", "d-flex", "justify-content-center", "mb-3");

            col.innerHTML = `
    <div class="card" style="width: 10rem; border: none; overflow: hidden;">
        <img src="${coordinator.imageURL}" class="card-img-top img-fluid" style="height: 130px;">
            <div class="card-body text-center">
                <h5 class="card-title fw-bold fs-6">${coordinator.name}</h5>
                <p class="card-text">${coordinator.designation}</p>
            </div>
    </div>
                                  `;
            coordinatorsContainer.appendChild(col);
        });
    }

    renderCoordinators();
});

fetch('/api/hello')
    .then(res => res.json())
    .then(data => console.log(data.message));


// Signup
function signup() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
        .then(res => res.text())
        .then(alert);
}


//Login
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.text())
        .then(alert);
}





