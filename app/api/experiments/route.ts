import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { experimentService } from '@/lib/experiments';
import type { ApiExperimentCreate, ApiExperimentAssign, ApiExperimentStats, ApiExperimentComplete } from '@/types/experiments';

export async function GET(
  request: Request,
  { params }: { params: { experimentKey: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';
    const experimentKey = params.experimentKey;

    switch (action) {
      case 'stats': {
        const stats = await experimentService.getExperimentStats(experimentKey);
        return NextResponse.json({
          success: true,
          experimentKey,
          ...stats,
        });
      }

      case 'assign': {
        const userId = searchParams.get('userId') || String(Date.now());
        const variant = await experimentService.assignVariant(experimentKey, userId);
        return NextResponse.json({
          success: true,
          experimentKey,
          variant,
          userId,
        });
      }

      case 'isActive': {
        const isActive = await experimentService.isExperimentActive(experimentKey);
        return NextResponse.json({
          success: true,
          experimentKey,
          isActive,
        });
      }

      case 'complete': {
        const results = await experimentService.completeExperiment(experimentKey);
        return NextResponse.json({
          success: true,
          experimentKey,
          ...results,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Experiment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Experiment not found or invalid action' },
      { status: 404 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { experimentKey: string } }
) {
  try {
    const body = await request.json();

    const action = body.action || 'assign';

    switch (action) {
      case 'assignVariant': {
        const { userId } = body;
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'userId is required' },
            { status: 400 }
          );
        }

        const assignedVariant = await experimentService.assignVariant(
          params.experimentKey,
          userId
        );

        return NextResponse.json({
          success: true,
          experimentKey: params.experimentKey,
          variant: assignedVariant,
          userId,
        });
      }

      case 'recordConversion': {
        const { converted, userId } = body;
        await experimentService.recordConversion(
          params.experimentKey,
          userId || String(Date.now()),
          converted
        );

        return NextResponse.json({
          success: true,
          experimentKey: params.experimentKey,
          message: 'Conversion recorded',
        });
      }

      case 'validateConfig': {
        const { valid, errors } = experimentService.validateExperimentConfig(
          params.experimentKey,
          body.config
        );

        return NextResponse.json({
          success: true,
          valid,
          errors,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown POST action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Experiment API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process experiment request' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { experimentKey: string } }
) {
  try {
    const body = await request.json();

    const action = body.action || 'updateStatus';

    switch (action) {
      case 'start': {
        await prisma.aBExperiment.update({
          where: { key: params.experimentKey },
          data: { status: 'running', startedAt: new Date() },
        });
        return NextResponse.json({
          success: true,
          experimentKey: params.experimentKey,
          message: 'Experiment started',
        });
      }

      case 'pause': {
        await prisma.aBExperiment.update({
          where: { key: params.experimentKey },
          data: { status: 'paused' },
        });
        return NextResponse.json({
          success: true,
          experimentKey: params.experimentKey,
          message: 'Experiment paused',
        });
      }

      case 'complete': {
        const results = await experimentService.completeExperiment(
          params.experimentKey
        );
        return NextResponse.json({
          success: true,
          experimentKey: params.experimentKey,
          ...results,
        });
      }

      case 'updateStatus': {
        const { status } = body;
        if (status && ['draft', 'running', 'paused', 'completed', 'archived'].includes(status)) {
          await prisma.aBExperiment.update({
            where: { key: params.experimentKey },
            data: { status },
          });
          return NextResponse.json({
            success: true,
            experimentKey: params.experimentKey,
            message: `Experiment status updated to ${status}`,
          });
        }
        return NextResponse.json(
          { success: false, error: 'Invalid status value' },
          { status: 400 }
        );
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown PUT action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Experiment API PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update experiment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { experimentKey: string } }
) {
  try {
    await prisma.aBExperiment.delete({
      where: { key: params.experimentKey },
    });

    // Clean up user assignments
    await prisma.aBExperimentUser.deleteMany({
      where: { experiment: params.experimentKey },
    });

    return NextResponse.json({
      success: true,
      experimentKey: params.experimentKey,
      message: 'Experiment deleted',
    });
  } catch (error) {
    console.error('Experiment API DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete experiment' },
      { status: 500 }
    );
  }
}
