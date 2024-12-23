document.getElementById('toggleInspect').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const button = document.getElementById('toggleInspect');
  const status = document.getElementById('status');
  
  if (button.textContent === 'Start Inspection') {
    chrome.tabs.sendMessage(tab.id, { action: 'startInspect' });
    button.textContent = 'Stop Inspection';
    status.textContent = 'Inspecting... Hover over elements to see their styles';
  } else {
    chrome.tabs.sendMessage(tab.id, { action: 'stopInspect' });
    button.textContent = 'Start Inspection';
    status.textContent = 'Click to start inspecting elements';
  }
});
