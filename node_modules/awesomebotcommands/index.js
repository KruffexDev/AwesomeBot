const commands = [
{
    name: "play",
    description: "Plays a song!",
    options: [
        {
            name: "query",
            type: "3",
            description: "The song you want to play",
            required: true
        }
    ]
},
{
	name: "stop",
	description: "Stops music and destroys the queue",
},
{
	name: "addsong",
	description: "add song to the queue",
	options: [
		{
			name: "query", 
			type: "3", 
			description: "The song you want to add",
			required: true
		}
	]
},
{
	name: "skip",
	description: "Skips current track!",
},
]; 

module.exports = {
	commands: commands
};