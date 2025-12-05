import { Router, Request, Response } from 'express';
import { createTodo, deleteTodo, getTodoById, getTodos, updateTodo } from '../service/todoService';

const router = Router();


router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await getTodos();
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
});



router.get("/:id", async (req: Request, res: Response) => {
    try{
        const id = parseInt(req.params.id);
        const result = await getTodoById(id);

        if(!result){
            return  res.status(404).json({message: "Todo not found"});
        }
        res.status(200).json(result);
    }catch(error){
        res.status(500).json({message: "Internal Server Error"});
    }
});



router.post("/", async (req: Request, res: Response) => {
    try{
        if(!req.body || !req.body.title){
            return res.status(400).json({message: "Title is required"});
        }
        if(!req.body.description){
            return res.status(400).json({message: "Description is required"});
        }

        const newTodo = {
            title: req.body.title,
            description: req.body.description
        };

        const result = await createTodo(newTodo);
        res.status(201).json(result);
    }
    catch(error){
        res.status(500).json({message: "Internal Server Error"});
    }
});


router.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updatedRecord = await updateTodo(id, req.body);

        if(!updatedRecord){
            return res.status(404).json({message: "Todo not found"});
        }
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const deletedRecord = await deleteTodo(id);
        if(!deletedRecord){
            return res.status(404).json({message: "Todo not found"});
        }
        res.status(200).json(deletedRecord);
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
});

export default router;