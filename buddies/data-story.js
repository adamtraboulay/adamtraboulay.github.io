const projectStory = document.getElementById('data-story');
const projectSteps = [
  { label: '01 / THE DATA', message: '395 student records. The question: how much can we learn about a final grade before seeing any earlier grades?', emphasis: 'none' },
  { label: '02 / HABITS', message: 'Study habits and background alone offer a limited signal. The model reaches an R² of about 0.28.', emphasis: 'habits' },
  { label: '03 / GRADES', message: 'Add the first two period grades, and the model reaches an R² of about 0.86. Those earlier results tell a much clearer story.', emphasis: 'grades' },
  { label: '04 / THE POINT', message: 'A prediction is only as useful as the information behind it. Showing both models makes that limitation visible.', emphasis: 'both' }
];
const projectButtons = [...projectStory.querySelectorAll('.featured-buddy')];
const projectLabel = document.getElementById('story-step');
const projectMessage = document.getElementById('story-message');
const projectPanel = projectStory.querySelector('.featured-project-panel');

projectButtons.forEach((button, index) => {
  const select = () => {
    const step = projectSteps[index];
    projectButtons.forEach((item, itemIndex) => item.setAttribute('aria-pressed', String(itemIndex === index)));
    projectLabel.textContent = step.label;
    projectMessage.textContent = step.message;
    projectPanel.dataset.emphasis = step.emphasis;
  };
  button.addEventListener('pointerenter', select);
  button.addEventListener('focus', select);
  button.addEventListener('click', select);
});

projectPanel.dataset.emphasis = projectSteps[0].emphasis;
