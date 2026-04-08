/**
 * MATCH CONTROLLER  (controllers/match.controller.js)
 * =====================================================
 * Handles all HTTP requests related to the /api/matches resource.
 *
 * This controller follows the exact same patterns as TeamController:
 *   - Arrow-function class methods (preserves `this` when Express calls handlers)
 *   - try/catch in every handler with next(error) for error propagation
 *   - HTTP-level input validation (required fields, logical checks)
 *   - Delegates ALL business logic to the MatchService
 *   - Singleton export at the bottom
 *
 * MATCH LIFECYCLE (STATE MACHINE)
 * --------------------------------
 * A match moves through a series of statuses. The controller exposes
 * one endpoint per transition:
 *
 *   scheduled ──▶ live ──▶ finished
 *       │
 *       └──▶ postponed
 *
 *   POST   /schedule   → creates a new match (status: "scheduled")
 *   PUT    /:id/start  → scheduled → live
 *   PUT    /:id/finish → live → finished
 *   PUT    /:id/postpone → scheduled → postponed
 *
 * Each transition endpoint only extracts the match id from the URL and
 * delegates the state-transition validation to the service layer.
 */

import { matchService } from "../services/match.service.js";

export class MatchController {
  /**
   * GET /api/matches
   * Returns all matches, enriched with team names by the service.
   */
  getAll = async (req, res, next) => {
    try {
      const matches = await matchService.getAll();

      res.json(matches);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/matches/:id
   * Returns a single match by UUID, enriched with team names.
   * The service throws a 404 error if the match doesn't exist.
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;

      const match = await matchService.getById(id);

      res.json(match);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/matches/schedule
   * Creates a new match between two teams.
   *
   * HTTP-LEVEL VALIDATION (controller's responsibility):
   *   - Both homeTeamId and awayTeamId must be present in the body.
   *   - A team cannot play against itself (same id for both).
   *
   * The service validates that both team IDs actually exist in the database.
   * Separating these concerns keeps each layer focused on what it knows:
   *   Controller → "is the request well-formed?"
   *   Service    → "do the referenced entities exist?"
   */
  scheduleMatch = async (req, res, next) => {
    try {
      const { homeTeamId, awayTeamId, scheduledAt } = req.body;

      if (!homeTeamId || !awayTeamId) {
        const err = new Error(`homeTeamId and awayTeamId are required.`);
        err.status = 400;
        return next(err);
      }

      if (homeTeamId === awayTeamId) {
        const err = new Error(`A team cannot play with itself.`);
        err.status = 400;
        return next(err);
      }

      const match = await matchService.scheduleMatch(
        homeTeamId,
        awayTeamId,
        scheduledAt,
      );

      res.json(match);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/matches/:id/start
   * Transitions a match from "scheduled" → "live".
   * The service enforces the state-machine rule (only scheduled matches
   * can be started). The controller just extracts the id and delegates.
   */
  startMatch = async (req, res, next) => {
    try {
      const { id } = req.params;
      const match = await matchService.startMatch(id);
      res.json(match);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/matches/:id/finish
   * Transitions a match from "live" → "finished".
   * Only live matches can be finished — the service validates this.
   */
  finishMatch = async (req, res, next) => {
    try {
      const { id } = req.params;
      const match = await matchService.finishMatch(id);
      res.json(match);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/matches/:id/postpone
   * Transitions a match from "scheduled" → "postponed".
   * Only scheduled matches can be postponed — the service validates this.
   */
  postponeMatch = async (req, res, next) => {
    try {
      const { id } = req.params;
      const match = await matchService.postponeMatch(id);
      res.json(match);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/matches/:id/goal
   * Adds a goal event to a live match.
   *
   * FLOW:
   * - Router extracts :id and calls this handler.
   * - Controller reads req.params + req.body.
   * - Service validates match status/team membership and updates score.
   * - Updated match is returned to the client.
   */
  addGoal = async (req, res, next) => {
    try {
      const { id: matchId } = req.params;
      const { teamId, scorer, minute } = req.body;
      const match = await matchService.addGoal(matchId, {
        teamId,
        scorer,
        minute,
      });
      res.status(201).json(match);
    } catch (error) {
      next(error);
    }
  };
}

// Singleton instance — same pattern as TeamController.
export const matchController = new MatchController();
