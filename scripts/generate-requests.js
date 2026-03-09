const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const baseUrl = `http://localhost:${PORT}`;

const requestsDir = path.join(__dirname, '..', 'requests');
const requests = [
  {
    fileName: 'get_all_notes.rest',
    content: `get ${baseUrl}/api/notes\n`
  },
  {
    fileName: 'get_note_by_id.rest',
    content: `get ${baseUrl}/api/notes/1\n`
  },
  {
    fileName: 'delete_note_by_id.rest',
    content: `delete ${baseUrl}/api/notes/1\n`
  }
];

fs.mkdirSync(requestsDir, { recursive: true });

requests.forEach(({ fileName, content }) => {
  const filePath = path.join(requestsDir, fileName);
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log(`Generated ${requests.length} request files in ${requestsDir}`);
