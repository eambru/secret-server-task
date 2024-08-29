import { Router, Request, Response } from 'express';
import { Builder } from 'xml2js';
import { getRepository } from 'typeorm';
import { Secret } from '../entity/Secret';
import { v4 as uuidv4 } from 'uuid';
import { parseString } from 'xml2js';

export const secretRoutes = Router();

/**
 * @swagger
 * /v1/secret:
 *   post:
 *     summary: Add a new secret
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secret:
 *                 type: string
 *               expireAfterViews:
 *                 type: integer
 *               expireAfter:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Secret added successfully
 *       405:
 *         description: Invalid input
 */

secretRoutes.post('/', async (req: Request, res: Response) => {
  const { secret, expireAfterViews, expireAfter } = req.body;
  if (!secret || expireAfterViews < 1 || expireAfter < 0) {
    return res.status(405).json({ message: 'Invalid input' });
  }

  const expiresAt = expireAfter > 0 ? new Date(Date.now() + expireAfter * 60000) : undefined;
  
  const secretRepo = getRepository(Secret);
  const newSecret = new Secret();
  newSecret.id = uuidv4();
  newSecret.secretText = secret;
  newSecret.expiresAt = expiresAt;
  newSecret.remainingViews = expireAfterViews;

  await secretRepo.save(newSecret);

  const response = {
    hash: newSecret.id,
    secretText: newSecret.secretText,
    createdAt: newSecret.createdAt.toISOString(),
    expiresAt: newSecret.expiresAt?.toISOString() || null,
    remainingViews: newSecret.remainingViews,
  };

  if (req.headers.accept === 'application/xml') {
    res.set('Content-Type', 'application/xml');
    const builder = new Builder();
    const xml = builder.buildObject(response); 
    res.send(xml);
  } else {
    res.json(response);
  }
});

/**
 * @swagger
 * /v1/secret/{id}:
 *   get:
 *     summary: Find a secret by hash
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique hash of the secret
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Secret found successfully
 *       404:
 *         description: Secret not found
 */

secretRoutes.get('/:id', async (req: Request, res: Response) => {
  const secretRepo = getRepository(Secret);
  const secret = await secretRepo.findOneBy({ id: req.params.id});

  if (!secret || (secret.expiresAt && new Date() > secret.expiresAt) || secret.remainingViews <= 0) {
    return res.status(404).json({ message: 'Secret not found' });
  }

  secret.remainingViews -= 1;
  await secretRepo.save(secret);

  const response = {
    hash: secret.id,
    secretText: secret.secretText,
    createdAt: secret.createdAt.toISOString(),
    expiresAt: secret.expiresAt?.toISOString() || null,
    remainingViews: secret.remainingViews,
  };

  if (req.headers.accept === 'application/xml') {
    res.set('Content-Type', 'application/xml');
    parseString(response, { explicitArray: false }, (err, result) => {
      if (err) {
        res.status(500).send('Error generating XML response');
      } else {
        res.send(result);
      }
    });
  } else {
    res.json(response);
  }
});