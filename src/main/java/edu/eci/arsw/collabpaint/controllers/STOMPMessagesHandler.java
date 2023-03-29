package edu.eci.arsw.collabpaint.controllers;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class STOMPMessagesHandler {
	
	@Autowired
	SimpMessagingTemplate msgt;

    ConcurrentHashMap<Integer, CopyOnWriteArrayList<Point>> poligono = new ConcurrentHashMap<>();
    
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
		System.out.println("El servidor a recibido un nuevo punto!: " + pt);

        int indice = Integer.parseInt(numdibujo)-1;
        if (poligono.get(indice) == null){
            poligono.put(indice, new CopyOnWriteArrayList<>());
            poligono.get(indice).add(pt);
        }else if (poligono.get(indice).size() % 4 == 0){
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, poligono.get(indice).subList(poligono.get(indice).size()-4,poligono.get(indice).size()));
            poligono.get(indice).add(pt);
        }else {
            poligono.get(indice).add(pt);
        }

		msgt.convertAndSend("/topic/newpoint" + numdibujo, pt);
	}
}