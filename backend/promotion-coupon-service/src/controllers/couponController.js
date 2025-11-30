import Coupon from '../models/coupon.js';
import CouponUtilisation from '../models/CouponUtilisation.js';

// ===== CRUD Operations =====

// @desc    Créer un nouveau coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Coupon créé avec succès',
      data: coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ce code de coupon existe déjà',
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtenir tous les coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res) => {
  try {
    const { actif, type, page = 1, limit = 10 } = req.query;

    const query = {};
    if (actif !== undefined) query.actif = actif === 'true';
    if (type) query.type = type;

    const coupons = await Coupon.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Coupon.countDocuments(query);

    res.status(200).json({
      success: true,
      data: coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtenir un coupon par ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mettre à jour un coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon mis à jour avec succès',
      data: coupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Supprimer un coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== Business Logic Operations =====

// @desc    Vérifier la validité d'un coupon par code
// @route   POST /api/coupons/verify
// @access  Public
export const verifyCoupon = async (req, res) => {
  try {
    const { code, userId, amount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Le code du coupon est requis',
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Code coupon invalide',
      });
    }

    // Vérifier la validité générale
    if (!coupon.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Ce coupon n\'est plus valide',
        details: {
          actif: coupon.actif,
          date_debut: coupon.date_debut,
          date_fin: coupon.date_fin,
          utilisations_restantes: coupon.utilisations_restantes,
        },
      });
    }

    // Vérifier si l'utilisateur peut l'utiliser
    if (userId) {
      const canUse = await coupon.canBeUsedByUser(userId);
      if (!canUse) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez atteint la limite d\'utilisation de ce coupon',
        });
      }
    }

    // Calculer la réduction si un montant est fourni
    let discountInfo = null;
    if (amount) {
      discountInfo = coupon.applyDiscount(parseFloat(amount));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon valide',
      data: {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          date_fin: coupon.date_fin,
        },
        discount: discountInfo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Appliquer un coupon à une réservation
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res) => {
  try {
    const { code, userId, reservationId, amount } = req.body;

    if (!code || !userId || !reservationId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Coupon invalide',
      });
    }

    // Vérifier si l'utilisateur peut utiliser ce coupon
    const canUse = await coupon.canBeUsedByUser(userId);
    if (!canUse) {
      return res.status(400).json({
        success: false,
        message: 'Limite d\'utilisation atteinte pour ce coupon',
      });
    }

    // Calculer la réduction
    const discount = coupon.applyDiscount(parseFloat(amount));

    // Enregistrer l'utilisation
    await CouponUtilisation.create({
      coupon_id: coupon._id,
      user_id: userId,
      reservation_id: reservationId,
      montant_original: discount.montant_original,
      montant_reduction: discount.reduction,
      montant_final: discount.montant_final,
    });

    // Incrémenter le compteur d'utilisations
    coupon.utilises += 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon appliqué avec succès',
      data: {
        coupon: coupon.code,
        discount,
        utilisations_restantes: coupon.utilisations_restantes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtenir les statistiques d'un coupon
// @route   GET /api/coupons/:id/stats
// @access  Private/Admin
export const getCouponStats = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon non trouvé',
      });
    }

    // Obtenir les utilisations
    const utilisations = await CouponUtilisation.find({ coupon_id: coupon._id });

    // Calculer les statistiques
    const totalReduction = utilisations.reduce(
      (sum, util) => sum + util.montant_reduction,
      0
    );

    const utilisateursUniques = new Set(utilisations.map(u => u.user_id)).size;

    res.status(200).json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          actif: coupon.actif,
          isValid: coupon.isValid,
        },
        statistiques: {
          total_utilisations: coupon.utilises,
          utilisations_restantes: coupon.utilisations_restantes,
          utilisateurs_uniques: utilisateursUniques,
          total_reduction_accordee: totalReduction.toFixed(2),
          taux_utilisation:
            coupon.max_utilisation > 0
              ? ((coupon.utilises / coupon.max_utilisation) * 100).toFixed(2)
              : 'Illimité',
        },
        utilisations_recentes: utilisations.slice(-10),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Générer des codes de coupon aléatoires
// @route   POST /api/coupons/generate
// @access  Private/Admin
export const generateCouponCodes = async (req, res) => {
  try {
    const { quantity = 1, prefix = '', length = 8 } = req.body;

    const codes = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < quantity; i++) {
      let code = prefix;
      for (let j = 0; j < length; j++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      codes.push(code);
    }

    res.status(200).json({
      success: true,
      message: `${quantity} code(s) généré(s)`,
      data: codes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};