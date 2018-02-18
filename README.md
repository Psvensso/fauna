Common code used in Fauna

## Goals
The goal of the "game" is to best guess the target object the player is looking for. We do that by asking a set of questions about the object and once we are somewhat sure we present our guesses to the user.  

## Domain
- ```TargetObject``` are the "thing" or "real life object" were trying to guess.
- A ```Question``` is a "question" or "statement" about the target.
- And the ```Answer``` is how the player values that statement on a scale from very untrue to very possitive.

### Weights / Model
The model is a Vector3 with [questionId, targetId, sum of previous answers] in it. With this model we can see how the community ranks the statement on that question - object. 

Visual example: 
["Chanterelle", "Is it blue?", 0.005]
["Chanterelle", "Is it yellow?", 0.9500]

The "Chanterelle" is the TargetObject, secondly is the question/statement about the object and the number weight are the sum concencus. When the player answers the question it alters the weight  in the favor of it's answer. 

#### Temporary model
While the player is playing the game holds a temporary model in session. This temp model starts with the real concensus model and adds the answers from the player to it. 

### Asking questions
The algorithm must provide the "best question" to ask the player. To start off the game must provide a set of starting questions, theese are "hard coded". Here some clever sharding must take place but for now, based on this set of startup questions the list of objects are ranked and at a threshold value the list is cut off so that only a subset remains.

Now the best question to answer next is the question that splits the remaining objects in half. E.g. where we have the most disagreement.

So when ranking the questions a list of questions come back with their rank values.

##### Ranking a question, example: 
Question: "Is it a tree?"
If half of our remaining list of objects are trees and the other half are clearly not its a good question to ask.

The ***half*** is the important part, the question that are closest to half (e.g. has most disagreement) are the best question to ask.
