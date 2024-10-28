const app = require('express')();
const PORT = process.env.PORT || 8000;


app.get('/', (req ,res) => {
  return res.json({ 
    message: 'Hello, Node.js from container!'
   });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});